import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { StorySchema } from './stories.schema';
import { StoryGroups } from '../storyGroups/storyGroups.collection';

export const Stories = new Mongo.Collection('stories');

// Deny all client-side updates on the Projects collection
Stories.deny({
    insert() {
        return true;
    },
    update() {
        return true;
    },
    remove() {
        return true;
    },
});

if (Meteor.isServer) {
    Meteor.publish('stories', function(projectId) {
        check(projectId, String);
        return Stories.find({ projectId });
    });

    Meteor.publish('stories.intro', function(projectId) {
        check(projectId, String);
        const { _id: storyGroupId } = StoryGroups.findOne({ introStory: true, projectId }, { fields: { _id: 1 } });
        return Stories.find({ projectId, storyGroupId });
    });

    Meteor.publish('stories.inGroup', function(projectId, groupId) {
        check(groupId, String);
        check(projectId, String);
        return Stories.find({ projectId, storyGroupId: groupId });
    });

    Meteor.publish('stories.light', function(projectId) {
        check(projectId, String);
        return Stories.find({ projectId }, { fields: { title: true, checkpoints: true, storyGroupId: true } });
    });
}

Stories.attachSchema(StorySchema);
