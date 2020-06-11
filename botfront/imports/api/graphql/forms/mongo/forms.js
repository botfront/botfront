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
        latest_event_time: latestEventTime,
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
        date: new Date(latestEventTime),
    });

    return { success: true };
};

export const importSubmissions = async (args) => {
    const { form_results: formResults, projectId, environment } = args;
    const latestAddition = await FormResults.findOne({ environment, projectId })
        .select('date')
        .sort('-date')
        .lean()
        .exec();
    const latestTimestamp = latestAddition
        ? new Date(latestAddition.date) : new Date(0);
    const submissionsToHandle = formResults
        .filter(c => new Date(c.date) >= latestTimestamp);
    const results = await Promise.all(submissionsToHandle
        .map(({
            _id: oldId, environment: oldEnv, projectId: oldPid, ...submission
        }) => {
            const { conversationId, date } = submission;
            return FormResults.updateOne(
                {
                    conversationId, date, environment, projectId,
                },
                submission,
                { upsert: true },
            );
        }));
    const nTotal = formResults.length;
    const nPushed = submissionsToHandle.length;
    const failed = [];
    let nInserted = 0;
    let nUpdated = 0;

    results.forEach(({ ok, upserted = [] }, index) => {
        if (!ok) failed.push(submissionsToHandle[index]._id);
        else if (upserted.length) nInserted += 1;
        else nUpdated += 1;
    });
    return {
        nTotal, nPushed, nInserted, nUpdated, failed,
    };
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
