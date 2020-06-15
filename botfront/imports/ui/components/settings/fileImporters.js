import { wrapMeteorCallback } from '../utils/Errors';
import { CREATE_AND_OVERWRITE_RESPONSES as createResponses, DELETE_BOT_RESPONSE as deleteReponse } from '../templates/mutations';
import { GET_BOT_RESPONSES as listResponses } from '../templates/queries';
import apolloClient from '../../../startup/client/apollo';

export const handleImportStoryGroups = (files, {
    projectId, fileReader: [_, setFileList], setImportingState, wipeCurrent, existingStoryGroups,
}) => {
    if (!files.length) return;
    setImportingState(true);
    const insert = () => files.forEach(({
        _id, name, parsedStories, filename, lastModified,
    }, idx) => {
        const callback = (error) => {
            if (!error) setFileList({ delete: { filename, lastModified } });
            if (error || idx === files.length - 1) setImportingState(false);
        };
        Meteor.call(
            'storyGroups.insert',
            { _id, name, projectId },
            wrapMeteorCallback((err) => {
                if (!parsedStories.length || err) return callback(err);
                return Meteor.call(
                    'stories.insert',
                    parsedStories.map(s => ({ ...s, projectId })),
                    wrapMeteorCallback(callback),
                );
            }),
        );
    });
    if (wipeCurrent) {
        Promise.all(existingStoryGroups.map(sg => Meteor.callWithPromise('storyGroups.delete', sg))).then(
            insert, () => setImportingState(false),
        );
    } else insert();
};

const wipeDomain = async (projectId, existingSlots) => {
    const { data: { botResponses } = {} } = await apolloClient
        .query({
            query: listResponses,
            variables: { projectId },
        });
    if (!Array.isArray(botResponses)) throw new Error();
    const deletedResponses = await Promise.all(botResponses.map(r => apolloClient.mutate({
        mutation: deleteReponse,
        variables: { projectId, key: r.key },
    })));
    if (deletedResponses.some(p => !p.data.deleteResponse.success)) throw new Error();
    const deletedSlots = await Promise.all(existingSlots.map(slot => Meteor.callWithPromise('slots.delete', slot)));
    if (deletedSlots.some(p => !p)) throw new Error();
    return true;
};

export const handleImportDomain = (files, {
    projectId, fileReader: [_, setFileList], setImportingState, wipeCurrent, existingSlots,
}) => {
    if (!files.length) return;
    setImportingState(true);
    const insert = () => files.forEach(({
        slots, responses, filename, lastModified,
    }, idx) => {
        const callback = (error) => {
            if (!error) setFileList({ delete: { filename, lastModified } });
            if (error || idx === files.length - 1) setImportingState(false);
        };
        Meteor.call(
            'slots.upsert',
            slots,
            projectId,
            wrapMeteorCallback((err) => {
                if (err) return callback(err);
                return apolloClient
                    .mutate({
                        mutation: createResponses,
                        variables: { projectId, responses },
                    })
                    .then((res) => {
                        if (!res || !res.data) {
                            return wrapMeteorCallback(callback)({
                                message: 'Responses not inserted',
                            });
                        }
                        const notUpserted = responses.filter(
                            ({ key }) => !res.data.createAndOverwriteResponses
                                .map(d => d.key)
                                .includes(key),
                        );
                        if (notUpserted.length) {
                            wrapMeteorCallback(callback)({
                                message: `Responses ${notUpserted.join(
                                    ', ',
                                )} not inserted.`,
                            });
                        }
                        return callback();
                    });
            }),
        );
    });
    if (wipeCurrent) {
        wipeDomain(projectId, existingSlots).then(
            insert, () => setImportingState(false),
        );
    } else insert();
};

export const handleImportDataset = (files, {
    projectId, fileReader: [_, setFileList], setImportingState, wipeCurrent,
}) => {
    if (!files.length) return;
    setImportingState(true);
    files.forEach((f, idx) => {
        Meteor.call(
            'nlu.import',
            f.rasa_nlu_data,
            projectId,
            f.language,
            wipeCurrent,
            f.canonical,
            wrapMeteorCallback((err) => {
                if (!err) {
                    setFileList({
                        delete: {
                            filename: f.filename,
                            lastModified: f.lastModified,
                        },
                    });
                }
                if (err || idx === files.length - 1) setImportingState(false);
            }),
        );
    });
};
