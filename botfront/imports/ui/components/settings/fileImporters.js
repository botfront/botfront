import { wrapMeteorCallback } from '../utils/Errors';
import { CREATE_AND_OVERWRITE_RESPONSES as createResponses } from '../templates/mutations';
import { UPSERT_FORM as upsertForm } from '../stories/graphql/queries';
import apolloClient from '../../../startup/client/apollo';

const handleImportForms = async (bfForms = [], projectId) => {
    const res = await Promise.all(bfForms.map(form => apolloClient
        .mutate({
            mutation: upsertForm,
            variables: { form: { ...form, projectId } },
        })));
    if (!res) return 'Forms not inserted.';
    const notUpserted = [];
    res.forEach(({ data } = {}, index) => {
        if (!data || !data.upsertForm || !data.upsertForm._id) {
            notUpserted.push(bfForms[index].name);
        }
    });
    if (notUpserted.length) {
        return `Forms ${notUpserted.join(', ')} not inserted.`;
    }
    return true;
};

const handleImportResponse = (responses, projectId) => new Promise(resolve => apolloClient
    .mutate({
        mutation: createResponses,
        variables: { projectId, responses },
    }).then((res) => {
        if (!res || !res.data) resolve('Responses not inserted.');
        const notUpserted = responses.filter(
            ({ key }) => !res.data.createAndOverwriteResponses
                .map(d => d.key)
                .includes(key),
        );
        if (notUpserted.length) {
            resolve(
                `Responses ${notUpserted.join(', ')} not inserted.`,
            );
        }
        resolve(true);
    }));

export const handleImportStoryGroups = (files, { projectId, fileReader: [_, setFileList], setImportingState }) => {
    if (!files.length) return;
    setImportingState(true);
    files.forEach(({
        _id, name, parsedStories, filename, lastModified,
    }, idx) => {
        const callback = wrapMeteorCallback((error) => {
            if (!error) setFileList({ delete: { filename, lastModified } });
            if (error || idx === files.length - 1) setImportingState(false);
        });
        Meteor.call(
            'storyGroups.insert',
            { _id, name, projectId },
            (err) => {
                if (!parsedStories.length || err) return callback(err);
                return Meteor.call(
                    'stories.insert',
                    parsedStories.map(s => ({ ...s, projectId })),
                    callback,
                );
            },
        );
    });
};

export const handleImportDomain = (files, { projectId, fileReader: [_, setFileList], setImportingState }) => {
    if (!files.length) return;
    setImportingState(true);
    files.forEach(({
        slots, bfForms, responses, filename, lastModified,
    }, idx) => {
        const callback = wrapMeteorCallback((error) => {
            if (!error) setFileList({ delete: { filename, lastModified } });
            if (error || idx === files.length - 1) setImportingState(false);
        });
        Meteor.call(
            'slots.upsert',
            slots,
            projectId,
            (err) => {
                if (err) return callback(err);
                return Promise.all([
                    handleImportResponse(responses, projectId),
                    handleImportForms(bfForms, projectId),
                ]).then((res) => {
                    const messages = res.filter(r => r !== true);
                    if (messages.length) return callback({ message: messages.join('\n') });
                    return callback();
                });
            },
        );
    });
};

export const handleImportDataset = (files, { projectId, fileReader: [_, setFileList], setImportingState }) => {
    if (!files.length) return;
    setImportingState(true);
    files.forEach((f, idx) => {
        Meteor.call(
            'nlu.import',
            f.rasa_nlu_data,
            projectId,
            f.language,
            false,
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
