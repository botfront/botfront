import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { StoryGroupSchema } from './storyGroups.schema';
import { createIntroStoryGroup } from './storyGroups.methods';

export const StoryGroups = new Mongo.Collection('storyGroups');

// Deny all client-side updates on the Projects collection
StoryGroups.deny({
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
    Meteor.publish('storiesGroup', function(projectId) {
        check(projectId, String);
        if (!StoryGroups.findOne({ projectId, introStory: true })) {
            createIntroStoryGroup(projectId);
        }
        return StoryGroups.find({ projectId });
    });
}

StoryGroups.attachSchema(StoryGroupSchema);
