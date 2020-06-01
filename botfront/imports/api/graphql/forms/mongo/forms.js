import Forms from '../forms.model';

export const getForms = async (projectId, names = null) => {
    if (!names) await Forms.find({ projectId }).lean();
    const forms = await Forms.find({ projectId, name: { $in: names } }).lean();
    return forms;
};

export const createForm = async (data) => {
    const { projectId, name } = data.form;
    return Forms.update(
        { projectId, name },
        { ...data.form },
        { upsert: true },
    );
};
