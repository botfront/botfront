import uuidv4 from 'uuid/v4';
import Forms from '../forms.model';
import BotResponses from '../../botResponses/botResponses.model';
import FormResults from '../form_results.model';
import { StoryGroups } from '../../../storyGroups/storyGroups.collection';
import { Slots } from '../../../slots/slots.collection';
import { auditLogIfOnServer } from '../../../../lib/utils';
import { combineSearches } from '../../story/mongo/stories';

export const getForms = async (projectId, ids = null) => {
    if (!ids) return Forms.find({ projectId }).lean();
    const forms = await Forms.find({ projectId, _id: { $in: ids } }).lean();
    return forms;
};

export const deleteForms = async ({ projectId, ids }) => {
    const forms = await Forms.find({ projectId, _id: { $in: ids } }).lean();
    await Promise.all(forms.map(form => StoryGroups.update(
        { _id: form.groupId },
        { $pull: { children: form._id } },
    )));
    const response = await Forms.remove({ projectId, _id: { $in: ids } }).exec();
    if (response.ok) return forms;
    return [];
};

const addNewSlots = async (projectId, slots, user) => {
    const slotNames = slots.map(({ name }) => name);
    const matchedSlots = await Slots.find({ projectId, name: { $in: slotNames } }, { fields: { name: 1 } }).fetch();
    if (!slotNames.length || slotNames.length === matchedSlots.length) return;
    slots.forEach(({ name }) => {
        if (matchedSlots.some(slot => slot.name === name)) return;
        const slotData = { name, type: 'unfeaturized', projectId };
        const newId = Slots.insert(slotData);
        auditLogIfOnServer('Inserted slot', {
            resId: newId,
            user,
            type: 'created',
            operation: 'slots.created',
            projectId,
            after: { slot: { _id: newId, ...slotData } },
            resType: 'slots',
        });
    });
};

// returns array of slotnames in other forms than the one passed.
const getSlotsInOtherForms = async (formId, projectId) => {
    const forms = await getForms(projectId);
    const otherForms = forms.filter(form => form._id !== formId);
    const slotsInOtherForms = [];
    otherForms.forEach((form) => {
        // eslint-disable-next-line no-param-reassign
        if (!form.slots) form.slots = [];
        form.slots.forEach(slot => slotsInOtherForms.push(slot.name));
    });
    return slotsInOtherForms;
};

export const deleteUnusedSlots = async (formId, projectId, newSlots, user) => {
    const previousForm = await Forms.findOne({ _id: formId }).lean();
    const newSlotNames = newSlots.map(({ name }) => name);
    const slotsInOtherForms = await getSlotsInOtherForms(formId, projectId);
    if (!previousForm) return;
    const slotsToRemove = previousForm.slots.reduce((acc, { name }) => {
        if (!newSlotNames.includes(name) && !slotsInOtherForms.some(slot => slot === name)) {
            return [...acc, name];
        }
        return acc;
    }, []);

    const removedSlots = Slots.find({
        projectId, name: { $in: slotsToRemove }, type: 'unfeaturized',
    }).fetch();
    Slots.remove({
        projectId, name: { $in: slotsToRemove }, type: 'unfeaturized',
    });
    removedSlots.forEach((slot) => {
        auditLogIfOnServer('Deleted slot', {
            resId: slot._id,
            user,
            projectId,
            type: 'deleted',
            operation: 'slots.deleted',
            before: { slot },
            resType: 'slots',
        });
    });

    const responseKeys = [];
    removedSlots.forEach(({ name }) => {
        responseKeys.push(
            `utter_ask_${name}`,
            `utter_valid_${name}`,
            `utter_invalid_${name}`,
        );
    });
    const responseQuery = { projectId, key: { $in: responseKeys } };
    const removedResponses = await BotResponses.find(responseQuery).lean();
    await BotResponses.deleteMany(responseQuery).exec();
    removedResponses.forEach((response) => {
        auditLogIfOnServer('Deleted response', {
            resId: response._id,
            user,
            projectId,
            type: 'deleted',
            operation: 'response-deleted',
            before: { response },
            resType: 'response',
        });
    });
};

const checkNewAndDuplicateName = async (_id, name) => {
    const idExists = await Forms.findOne({ _id }).lean();
    const nameExists = await Forms.findOne({ name }).lean();
    return !!nameExists && !idExists;
};

const getSafeFormName = async (projectId, originalName) => {
    const basicName = originalName.replace(/_form*/, '');
    const formsIncludingName = await Forms.find({ name: { $regex: basicName }, projectId }).lean();
    const formNames = (formsIncludingName || []).map(({ name }) => name);

    let safeName = basicName;
    let index = 1;
    while (formNames.includes(`${safeName}_form`)) {
        safeName = `${basicName}_${index}`;
        index += 1;
    }
    return `${safeName}_form`;
};

export const upsertForm = async (data, user) => {
    const {
        projectId, _id, groupName, ...update
    } = data.form;
    let chartSlots = [];
    if (update.graph_elements) {
        // If we receive such an array it's a bug, don't save it!
        if (update.graph_elements.length < 1) return { status: 'failed', value: {} };
        chartSlots = update.graph_elements
            .filter(elm => elm.type === 'slot')
            .map(elm => ({
                name: elm.data.slotName,
                validation: elm.data.validation,
                filling: elm.data.filling,
                utter_on_new_valid_slot: elm.data.utter_on_new_valid_slot,
            }));
        update.slots = chartSlots;
        // We only want to do that if we have graph elements already, if we don't
        // it means it's a form creation or a renaming
        await deleteUnusedSlots(_id, projectId, chartSlots, user);
    }

    const nonDuplicateName = update.name && (await checkNewAndDuplicateName(_id, update.name))
        ? await getSafeFormName(projectId, update.name)
        : update.name;

    const query = { ...(_id ? { _id } : {}), projectId, ...(!_id ? { name: nonDuplicateName } : {}) };
    const insertId = _id || uuidv4();
    const result = await Forms.findOneAndUpdate(
        query,
        {
            $set: { ...update, ...(update.name ? { name: nonDuplicateName } : {}) },
            ...(!_id ? { $setOnInsert: { _id: insertId } } : {}),
        },
        { new: true, upsert: true, rawResult: true },
    ).lean();

    const { lastErrorObject: { upserted } = {}, ok, value = {} } = result;
    if (upserted) {
        StoryGroups.update(
            { _id: update.groupId },
            {
                $push: { children: { $each: [_id || insertId], $position: 0 } },
                $set: { isExpanded: true },
            },
        );
    }
    addNewSlots(projectId, chartSlots, user);
    const status = !ok ? 'failed' : upserted ? 'inserted' : 'updated';
    return { status, value };
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
        latest_input_channel: latestInputChannel,
        active_form: activeForm,
        active_loop: activeLoop,
        slots,
    } = tracker;
    const { name: formName } = activeForm || activeLoop || {};

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
        date: new Date(latestEventTime * 1000),
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

export const searchForms = (projectId, search, botResponses) => {
    const slotsFromResponses = botResponses.reduce((acc, responseName) => {
        if (responseName.startsWith('utter_ask_')) {
            acc.push(responseName.replace(/^utter_ask_/, ''));
        }
        return acc;
    }, []);
    const allSlots = combineSearches(search, slotsFromResponses);
    return Forms.find({
        projectId,
        $or: [
            { 'slots.name': { $regex: allSlots, $options: 'i' } },
            { name: { $regex: allSlots, $options: 'i' } },
        ],
    }).lean();
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
            rows = rows.map(r => columns.map(c => `"${String(r[c]).replace(/"/g, '""')}"`).join(','));
            return [columns, ...rows].join('\n');
        },
    });
}
