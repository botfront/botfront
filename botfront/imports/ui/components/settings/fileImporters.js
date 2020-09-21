import uuidv4 from 'uuid/v4';
import { wrapMeteorCallback } from '../utils/Errors';
import { CREATE_AND_OVERWRITE_RESPONSES as createResponses, DELETE_BOT_RESPONSE as deleteReponse } from '../templates/mutations';
import { GET_BOT_RESPONSES as listResponses } from '../templates/queries';
import { UPSERT_FORM as upsertForm, GET_FORMS as getForms, DELETE_FORMS as deleteForms } from '../stories/graphql/queries';
import apolloClient from '../../../startup/client/apollo';
import { getGraphElementsFromDomain } from '../../../lib/form.utils';


const handleImportForms = async (bfForms = [], projectId, existingStoryGroups = []) => {
    const newGroupMapping = {};
    const existingGroupNames = existingStoryGroups.map(({ name }) => name);
    const res = await Promise.all(bfForms.map(async ({ groupName = 'forms', _id, ...form }) => {
        let groupId = newGroupMapping[groupName];
        if (!groupId) {
            const newGroupName = existingGroupNames.includes(groupName)
                ? `${groupName} (${new Date()
                    .toISOString()
                    .replace('T', ' ')
                    .replace('Z', '')})`
                : groupName;
            groupId = uuidv4();
            newGroupMapping[groupName] = groupId;
            await Meteor.callWithPromise(
                'storyGroups.insert',
                { _id: groupId, name: newGroupName, projectId },
            );
        }
        const graphElements = getGraphElementsFromDomain(form.graph_elements, form.slots);
        return apolloClient
            .mutate({
                mutation: upsertForm,
                variables: {
                    form: {
                        ...form, projectId, groupId, graph_elements: graphElements,
                    },
                },
            });
    }));
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

export const handleImportStoryGroups = (files, {
    projectId, fileReader: [_, setFileList], setImportingState, wipeCurrent, existingStoryGroups,
}) => {
    if (!files.length) return;
    setImportingState(true);
    const insert = () => files.forEach(({
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
    const { data: { getForms: forms = [] } = {} } = await apolloClient
        .query({
            query: getForms,
            variables: { projectId },
        });
    const { data: { deleteForms: formsDeleted = [] } = {} } = await apolloClient.mutate({
        mutation: deleteForms,
        variables: { projectId, ids: forms.map(({ _id }) => _id) },
    });
    if (!forms.every(({ _id }) => formsDeleted.find(({ _id: deletedId }) => _id === deletedId))) throw new Error();
    const deletedResponses = await Promise.all(botResponses.map(r => apolloClient.mutate({
        mutation: deleteReponse,
        variables: { projectId, key: r.key },
    })));
    if (deletedResponses.some(p => !p.data.deleteResponse.success)) throw new Error();
    const deletedSlots = await Promise.all(existingSlots.map(slot => Meteor.callWithPromise('slots.delete', slot, projectId)));
    if (deletedSlots.some(p => !p)) throw new Error();
    return true;
};

export const handleImportDomain = (files, {
    projectId, fileReader: [_, setFileList], setImportingState, wipeCurrent, existingSlots, existingStoryGroups,
}) => {
    if (!files.length) return;
    setImportingState(true);
    const insert = () => files.forEach(({
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
                    handleImportForms(bfForms, projectId, existingStoryGroups),
                ]).then((res) => {
                    const messages = res.filter(r => r !== true);
                    if (messages.length) return callback({ message: messages.join('\n') });
                    return callback();
                });
            },
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
