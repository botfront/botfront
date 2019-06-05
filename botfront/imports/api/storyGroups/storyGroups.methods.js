import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { StoryGroups } from './storyGroups.collection';

Meteor.methods({
    'storyGroups.delete'(storyGroup) {
        check(storyGroup, Object);
        return StoryGroups.remove(storyGroup);
    },

    'storyGroups.insert'(storyGroup) {
        check(storyGroup, Object);
        return StoryGroups.insert(storyGroup);
    },

    'storyGroups.update'(storyGroup) {
        check(storyGroup, Object);
        return StoryGroups.update({ _id: storyGroup._id }, { $set: storyGroup });
    },
});
