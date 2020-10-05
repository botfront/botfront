import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { StorySchema, RuleSchema } from './stories.schema';

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

Meteor.startup(() => {
    if (Meteor.isServer) {
        Stories._ensureIndex({ 'textIndex.contents': 'text', 'textIndex.info': 'text' });
    }
});

if (Meteor.isServer) {
    Meteor.publish('stories.selected', function(projectId, selectedIds) {
        check(selectedIds, [String]);
        check(projectId, String);
        return Stories.find({ projectId, _id: { $in: selectedIds } });
    });

    Meteor.publish('stories.light', function(projectId) {
        check(projectId, String);
        return Stories.find({ projectId }, { fields: { title: true, checkpoints: true, storyGroupId: true } });
    });
    Meteor.publish('stories.events', function(projectId) {
        check(projectId, String);
        return Stories.find({ projectId }, { fields: { title: true, events: true } });
    });
}

Stories.attachSchema(RuleSchema, { selector: { type: 'rule' } });
Stories.attachSchema(StorySchema, { selector: { type: 'story' } });
