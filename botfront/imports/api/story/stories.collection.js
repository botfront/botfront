import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { checkIfCan, checkIfScope } from '../../lib/scopes';
import { StorySchema } from './stories.schema';


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
        checkIfCan('stories:r', projectId);
        check(selectedIds, [String]);
        check(projectId, String);
        return Stories.find({ projectId, _id: { $in: selectedIds } });
    });

    Meteor.publish('stories.light', function(projectId) {
        check(projectId, String);
        if (!checkIfCan('stories:r', projectId, null, { backupPlan: true })) {
            checkIfScope(projectId, ['nlu-data:r', 'response:r', 'nlu-data:x'], this.userId);
            return Stories.find({ projectId }, { fields: { _id: 1 } });
        }
        return Stories.find({ projectId }, {
            fields: {
                title: true, checkpoints: true, storyGroupId: true, rules: true, status: true,
            },
        });
    });
    Meteor.publish('stories.events', function(projectId) {
        checkIfCan('responses:r', projectId);
        check(projectId, String);
        return Stories.find({ projectId }, { fields: { title: true, events: true } });
    });
}

Stories.attachSchema(StorySchema);
