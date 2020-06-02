import uuidv4 from 'uuid/v4';
import Forms from '../forms.model';

export const getForms = async (projectId, names = null) => {
    if (!names) return Forms.find({ projectId }).lean();
    const forms = await Forms.find({ projectId, name: { $in: names } }).lean();
    return forms;
};

export const deleteForms = async ({ projectId, ids }) => {
    const response = await Forms.remove({ projectId, _id: { $in: ids } }).exec();
    if (response.ok) return ids.map(_id => ({ _id }));
    return [];
};
export const upsertForm = async (data) => {
    const { projectId, name } = data.form;
    const { _id, ...update } = data.form;
    console.log(update);
    if (_id) {
        return Forms.updateOne(
            { _id },
            { $set: update },
        );
    }
    return Forms.update(
        { projectId, name },
        {
            $set: update,
            $setOnInsert: { _id: uuidv4() },
        },
        { upsert: true },
    );
};
