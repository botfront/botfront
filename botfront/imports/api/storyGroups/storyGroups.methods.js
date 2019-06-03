import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { StoryGroups } from './storyGroups.collection';

if (Meteor.isServer) {
    Meteor.methods({
        'storyGroups.insert'(storyGroup) {
            check(storyGroup, Object);
            return StoryGroups.insert(storyGroup);
        },
    });
}
