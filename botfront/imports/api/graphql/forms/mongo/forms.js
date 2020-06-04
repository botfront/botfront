import uuidv4 from 'uuid/v4';
import Forms from '../forms.model';
import { StoryGroups } from '../../../storyGroups/storyGroups.collection';
import { Projects } from '../../../project/project.collection';

export const getForms = async (projectId, ids = null) => {
    if (!ids) return Forms.find({ projectId }).lean();
    const forms = await Forms.find({ projectId, _id: { $in: ids } }).lean();
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
        console.log('A');
        return Forms.findOneAndUpdate(
            { projectId, _id },
            { $set: update },
        ).lean();
    }
    console.log('B');
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
            + await Forms.countDocuments({ projectId, pinned: true });
    const success = Projects.update(
        { _id: projectId },
        { $push: { storyGroups: { $each: upsertedIds, $position } } },
    );
    return { formsAdded: upsertedIds };
};
