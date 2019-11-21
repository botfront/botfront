import shortid from 'shortid';
import Activity from '../activity.model.js';

export const getActivity = async ({
    modelId,
    validated = false,
    sortKey,
    sortDesc,
}) => {
    const onlyValidated = validated ? { validated: true } : {};
    const sort = `${sortDesc ? '-' : ''}${sortKey || ''}`;
    const query = Activity.find({ modelId, ...onlyValidated })
    if (!sort) return query.lean();
    return query.sort(sort).lean();
};

export const upsertActivity = async ({ modelId, data }) => {
    const updates = data.map((datum) => { // no better way to do this than multiple queries
        const {
            _id, text, createdAt, ...utterance
        } = datum;
        const ID = _id ? { _id } : {}; // is id provided?
        const TEXT = text ? { text } : {}; // is text provided?
        return Activity.findOneAndUpdate(
            { modelId, ...TEXT, ...ID },
            { $set: { ...utterance, ...TEXT, updatedAt: new Date() }, $setOnInsert: { _id: shortid.generate(), createdAt: new Date() } },
            { upsert: true, new: true },
        ).exec();
    });
    return Promise.all(updates);
};

export const deleteActivity = async ({ modelId, ids }) => {
    const response = await Activity.remove({ modelId, _id: { $in: ids } }).exec();
    if (response.ok) return ids.map(_id => ({ _id }));
    return [];
};
