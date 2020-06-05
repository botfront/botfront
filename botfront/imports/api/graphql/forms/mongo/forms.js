import uuidv4 from 'uuid/v4';
import Forms from '../forms.model';
import FormResults from '../form_results.model';
import { StoryGroups } from '../../../storyGroups/storyGroups.collection';
import { Projects } from '../../../project/project.collection';

export const getForms = async (projectId, ids = null) => {
    if (!ids) return Forms.find({ projectId }).lean();
    const forms = await Forms.find({ projectId, _id: { $in: ids } }).lean();
    return forms;
};

export const deleteForms = async ({ projectId, ids }) => {
    Projects.update({ _id: projectId }, { $pull: { storyGroups: { $in: ids } } });
    const response = await Forms.remove({ projectId, _id: { $in: ids } }).exec();
    if (response.ok) return ids.map(_id => ({ _id }));
    return [];
};
export const upsertForm = async (data) => {
    const { projectId, _id, ...update } = data.form;
    if (_id) {
        return Forms.findOneAndUpdate({ projectId, _id }, { $set: update }).lean();
    }
    const result = await Forms.update(
        { projectId, name: update.form },
        {
            $set: update,
            $setOnInsert: { _id: uuidv4() },
        },
        { new: true, upsert: true, rawResult: true },
    );
    const { upserted } = result;
    const upsertedIds = upserted.map(({ _id: id }) => id);
    const $position = update.pinned
        ? 0
        : StoryGroups.find({ projectId, pinned: true }).count()
          + (await Forms.countDocuments({ projectId, pinned: true }));
    Projects.update(
        { _id: projectId },
        { $push: { storyGroups: { $each: upsertedIds, $position } } },
    );
    return { formsAdded: upsertedIds };
};

export const submitForm = async (args) => {
    const {
        projectId, environment = 'development', tracker = {}, metadata = {},
    } = args;

    if (typeof tracker !== 'object' || Array.isArray(tracker)) {
        throw new Error('Unexpected tracker format.');
    }
    const { userId, language } = metadata;
    const {
        sender_id: conversationId,
        active_form: { name: formName } = {},
        latest_input_channel: latestInputChannel,
        slots,
    } = tracker;

    const form = await Forms.findOne({ projectId, name: formName }).lean();
    const results = {};
    form.slots.forEach((s) => {
        if (s.name in slots) results[s.name] = slots[s.name];
    });

    await FormResults.create({
        userId,
        language,
        conversationId,
        formName,
        latestInputChannel,
        results,
        environment,
        projectId,
    });

    return { success: true };
};

const generateEnvironmentRestriction = suppliedEnvs => (Array.isArray(suppliedEnvs) && suppliedEnvs.length > 0
    ? { environment: { $in: suppliedEnvs } }
    : typeof suppliedEnvs === 'string'
        ? { environment: { $in: [suppliedEnvs] } }
        : {});

if (Meteor.isServer) {
    Meteor.methods({
        async 'forms.countSubmissions'({
            projectId,
            environments: suppliedEnvs,
        }) {
            const environments = generateEnvironmentRestriction(suppliedEnvs);
            const formNames = await FormResults.distinct('formName', { projectId, ...environments });
            const counts = await Promise.all(
                formNames.map(formName => FormResults.countDocuments({ projectId, ...environments, formName })),
            );
            const countsByName = {};
            formNames.forEach((name, index) => { countsByName[name] = counts[index]; });
            return countsByName;
        },
        async 'forms.export'({ projectId, environments: suppliedEnvs, formName }) {
            const environments = generateEnvironmentRestriction(suppliedEnvs);
            const submissions = await FormResults.find({
                projectId,
                ...environments,
                formName,
            })
                .sort({ date: -1 })
                .lean();

            const columns = [
                'date',
                'conversationId',
                'userId',
                'language',
                'environment',
                'latestInputChannel',
            ];
            let rows = [];
            submissions.forEach(
                ({
                    date,
                    conversationId,
                    userId,
                    language,
                    environment,
                    latestInputChannel,
                    results,
                }) => {
                    Object.keys(results || {}).forEach((k) => {
                        if (!columns.includes(k)) columns.push(k);
                    });
                    rows.push({
                        date,
                        conversationId,
                        userId,
                        language,
                        environment,
                        latestInputChannel,
                        ...results,
                    });
                },
            );
            rows = rows.map(r => columns.map(c => r[c]).join(','));
            return [columns, ...rows].join('\n');
        },
    });
}
