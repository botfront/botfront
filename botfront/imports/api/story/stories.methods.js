import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';
import { Stories } from './stories.collection';

Meteor.methods({
    'stories.insert'(story) {
        check(story, Object);
        checkIfCan('stories:w', story.projectId);
        return Stories.insert(story);
    },

    'stories.update'(story) {
        check(story, Object);
        checkIfCan('stories:w', story.projectId);
        return Stories.update({ _id: story._id }, { $set: story });
    },

    'stories.delete'(story) {
        check(story, Object);
        checkIfCan('stories:w', story.projectId);
        return Stories.remove(story);
    },
});
