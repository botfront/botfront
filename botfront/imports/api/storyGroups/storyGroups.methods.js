import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';
import { StoryGroups } from './storyGroups.collection';

Meteor.methods({
    'storyGroups.delete'(storyGroup, projectId) {
        check(storyGroup, Object);
        check(projectId, String);
        checkIfCan('stories:w', projectId);
        return StoryGroups.remove({ _id: storyGroup._id });
    },

    'storyGroups.insert'(storyGroup) {
        check(storyGroup, Object);
        checkIfCan('stories:w', storyGroup.projectId);
        return StoryGroups.insert(storyGroup);
    },

    'storyGroups.update'(storyGroup, projectId) {
        check(storyGroup, Object);
        check(projectId, String);
        checkIfCan('stories:w', projectId);
        return StoryGroups.update({ _id: storyGroup._id }, { $set: storyGroup });
    },
});
