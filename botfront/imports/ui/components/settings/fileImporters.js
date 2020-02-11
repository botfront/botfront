import { wrapMeteorCallback } from '../utils/Errors';
import { CREATE_AND_OVERWRITE_RESPONSES as createResponses } from '../templates/mutations';
import apolloClient from '../../../startup/client/apollo';

export const handleImportStoryGroups = (files, { projectId, fileReader, setImportingState }) => {
    if (!files.length) return;
    setImportingState(true);
    files.forEach(({
        _id, name, parsedStories, filename, lastModified,
    }, idx) => {
        const callback = (error) => {
            if (!error) fileReader[1]({ delete: { filename, lastModified } });
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
};

export const handleImportDomain = (files, { projectId, fileReader, setImportingState }) => {
    if (!files.length) return;
    setImportingState(true);
    files.forEach(({
        slots, templates, filename, lastModified,
    }, idx) => {
        const callback = (error) => {
            if (!error) fileReader[1]({ delete: { filename, lastModified } });
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
                        variables: { projectId, responses: templates },
                    })
                    .then((res) => {
                        if (!res || !res.data) {
                            return wrapMeteorCallback(callback)({
                                message: 'Templates not inserted',
                            });
                        }
                        const notUpserted = templates.filter(
                            ({ key }) => !res.data.createAndOverwriteResponses
                                .map(d => d.key)
                                .includes(key),
                        );
                        if (notUpserted.length) {
                            wrapMeteorCallback(callback)({
                                message: `Templates ${notUpserted.join(
                                    ', ',
                                )} not inserted.`,
                            });
                        }
                        return callback();
                    });
            }),
        );
    });
};

export const handleImportDataset = (files, { projectId, fileReader, setImportingState }) => {
    if (!files.length) return;
    setImportingState(true);
    files.forEach((f, idx) => {
        Meteor.call(
            'nlu.import',
            f.rasa_nlu_data,
            projectId,
            f.language,
            false,
            wrapMeteorCallback((err) => {
                if (!err) {
                    fileReader[1]({
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
