import uuidv4 from 'uuid/v4';
import Forms from '../forms.model';
import { StoryGroups } from '../../../storyGroups/storyGroups.collection';
import { Projects } from '../../../project/project.collection';

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
    const {
        projectId, _id, ...update
    } = data.form;
    if (_id) {
        const { ok: success } = await Forms.updateOne(
            { projectId, _id },
            { $set: update },
        );
        return { success };
    }
    const { upserted } = await Forms.update(
        { projectId, name: update.form },
        {
            $set: update,
            $setOnInsert: { _id: uuidv4() },
        },
        { new: true, upsert: true, rawResult: true },
    );
    const upsertedIds = upserted.map(({ _id: id }) => id);
    const $position = update.pinned
        ? 0
        : StoryGroups.find({ projectId, pinned: true }).count()
            + await Forms.countDocuments({ projectId, pinned: true });
    const success = Projects.update(
        { _id: projectId },
        { $push: { storyGroups: { $each: upsertedIds, $position } } },
    );
    return { success };
};
