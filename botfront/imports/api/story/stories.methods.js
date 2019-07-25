import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Stories } from './stories.collection';

Meteor.methods({
    'stories.insert'(story) {
        check(story, Object);
        return Stories.insert(story);
    },

    'stories.update'(story) {
        check(story, Object);
        return Stories.update({ _id: story._id }, { $set: story });
    },

    'stories.delete'(story) {
        check(story, Object);
        return Stories.remove(story);
    },

    'stories.getStories'(projectId) {
        check(projectId, String);
        return Stories.find({ projectId }).fetch();
    },
});
