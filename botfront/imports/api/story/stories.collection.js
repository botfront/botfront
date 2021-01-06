import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import { checkIfCan, checkIfScope } from '../../lib/scopes';
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
        checkIfCan('stories:r', projectId);
        check(selectedIds, [String]);
        check(projectId, String);
        return Stories.find({ projectId, _id: { $in: selectedIds } });
    });

    Meteor.publish('stories.light', function(projectId, language) {
        check(projectId, String);
        check(language, String);
        if (!checkIfCan('stories:r', projectId, null, { backupPlan: true })) {
            checkIfScope(projectId, ['nlu-data:r', 'response:r', 'nlu-data:x'], this.userId);
            return Stories.find({ projectId }, { fields: { _id: 1, type: 1 } });
        }
        return Stories.find({
            $or: [
                { projectId, type: 'test_case', language },
                { projectId, type: 'test_case', success: false },
                { projectId, type: { $not: { $eq: 'test_case' } } },
            ],
        }, {
            fields: {
                title: true, checkpoints: true, storyGroupId: true, type: true, rules: true, status: true, success: true,
            },
        });
    });
    Meteor.publish('stories.events', function(projectId, language) {
        checkIfCan('responses:r', projectId);
        check(projectId, String);
        check(language, Match.Maybe(String));
        const query = language ? {
            $or: [
                { projectId, type: 'test_case', language },
                { projectId, type: 'test_case', success: false },
                { projectId, type: { $not: { $eq: 'test_case' } } },
            ],
        } : { projectId };
        return Stories.find(query, { fields: { title: true, events: true } });
    });
}

Stories.attachSchema(TestSchema, { selector: { type: 'test_case' } });
Stories.attachSchema(RuleSchema, { selector: { type: 'rule' } });
Stories.attachSchema(StorySchema, { selector: { type: 'story' } });
