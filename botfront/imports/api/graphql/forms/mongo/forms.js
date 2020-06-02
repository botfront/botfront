import shortid from 'shortid';
import Forms from '../forms.model';

export const getForms = async (projectId, names = null) => {
    if (!names) return Forms.find({ projectId }).lean();
    const forms = await Forms.find({ projectId, name: { $in: names } }).lean();
    return forms;
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
            $setOnInsert: { _id: shortid.generate() },
        },
        { upsert: true },
    );
};
