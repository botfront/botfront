import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { StorySchema, RuleSchema, TestSchema } from './stories.schema';

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
        try {
            Stories._dropIndex('textIndex.contents_text_textIndex.info_text');
        } catch {
            // don't delete it if it doesn't exist
        }
        Stories._ensureIndex({ textIndex: 'text' });
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
        return Stories.find({ projectId }, {
            fields: {
                title: true, checkpoints: true, storyGroupId: true, type: true,
            },
        });
    });
    Meteor.publish('stories.events', function(projectId) {
        check(projectId, String);
        return Stories.find({ projectId }, { fields: { title: true, events: true } });
    });
}

Stories.attachSchema(TestSchema, { selector: { type: 'test_case' } });
Stories.attachSchema(RuleSchema, { selector: { type: 'rule' } });
Stories.attachSchema(StorySchema, { selector: { type: 'story' } });
