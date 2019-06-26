import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';
import { Stories } from './stories.collection';

Meteor.methods({
    'stories.insert'(story, projectId) {
        check(story, Object);
        check(projectId, String);
        checkIfCan('stories:w', projectId);
        return Stories.insert(story);
    },

    'stories.update'(story, projectId) {
        check(story, Object);
        check(projectId, String);
        checkIfCan('stories:w', projectId);
        return Stories.update({ _id: story._id }, { $set: story });
    },

    'stories.delete'(story, projectId) {
        check(story, Object);
        check(projectId, String);
        checkIfCan('stories:w', projectId);
        return Stories.remove(story);
    },
});
