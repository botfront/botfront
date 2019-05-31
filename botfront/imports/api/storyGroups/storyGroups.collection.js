import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { StorySchema } from './storyGroups.schema';

export const storyGroups = new Mongo.Collection('stories');

// Deny all client-side updates on the Projects collection
storyGroups.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

if (Meteor.isServer) {
    Meteor.publish('storiesGroup', function(projectId) {
        check(projectId, String);
        return storyGroups.find({ projectId });
    });
}

storyGroups.attachSchema(StorySchema);
