import shortid from 'shortid';
import Activity from '../activity.model.js';

export const getActivity = async ({ modelId }) => Activity.find(
    { modelId }, null,
).lean();

export const upsertActivity = async ({ modelId, data }) => {
    const updates = data.map((datum) => { // no better way to do this than multiple queries
        const {
            _id, text, createdAt, ...utterance
        } = datum;
        const ID = _id ? { _id } : {}; // is id provided?
        const TEXT = text ? { text } : {}; // is text provided?

        return Activity.updateOne(
            { modelId, ...TEXT, ...ID },
            { $set: { ...utterance, ...TEXT, updatedAt: new Date() }, $setOnInsert: { _id: shortid.generate(), createdAt: new Date() } },
            { upsert: true },
        ).exec();
    });
    const response = await Promise.all(updates);
    return { success: response.every(r => r.ok) };
};

export const deleteActivity = async ({ modelId, ids }) => {
    const response = await Activity.remove({ modelId, _id: { $in: ids } }).exec();
    return { success: response.ok };
};

export const addActivityToTraining = async ({ modelId, ids }) => {
    try {
        const examples = await Activity.find(
            { modelId, _id: { $in: ids } },
            {
                _id: 1, text: 1, intent: 1, canonical: 1, entities: 1,
            },
        ).lean();
        await Meteor.call('nlu.insertExamples', modelId, examples);
        await Activity.remove({ modelId, _id: { $in: ids } }).exec();
        return { success: true };
    } catch (e) {
        return { success: false };
    }
};
