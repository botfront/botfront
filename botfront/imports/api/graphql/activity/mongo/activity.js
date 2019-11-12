import shortid from 'shortid';
import Activity from '../activity.model.js';

export const getActivities = async ({ modelId }) => Activity.find(
    { modelId }, null,
).lean();

export const upsertActivities = async ({ modelId, data }) => {
    const updates = data.map((datum) => { // no better way to do this than multiple queries
        const { text, _id } = datum;
        const query = _id ? { _id } : {}; // is id provided?
        const utterance = datum;
        if (utterance.intent_ranking) delete utterance.intent_ranking;
        utterance.confidence = utterance.intent.confidence;
        utterance.intent = utterance.intent.name;
        if (utterance.entities) utterance.entities = utterance.entities.filter(e => e.extractor !== 'ner_duckling_http');
        return Activity.upsert(
            { modelId, text, ...query },
            { $set: { ...utterance, updatedAt: new Date() }, $setOnInsert: { _id: shortid.generate(), createdAt: new Date() } },
        );
    });
    return Promise.all(updates);
};

export const deleteActivities = async ({ modelId, ids }) => Activity.remove({ modelId, _id: { $in: ids } });

export const addActivitiesToTraining = async ({ modelId, ids }) => {
    const examples = await Activity.find({ modelId, _id: { $in: ids } });
    await Meteor.call('nlu.insertExamples', modelId, examples);
    return Activity.remove({ modelId, _id: { $in: ids } });
};
