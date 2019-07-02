import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { StoryGroups } from './storyGroups.collection';

export const createIntroStoryGroup = (projectId) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    Meteor.call(
        'storyGroups.insert',
        {
            name: 'Intro Story Group',
            projectId,
            introStory: true,
        },
        (err, groupId) => {
            if (!err) {
                Meteor.call('stories.insert', {
                    story: '## Get started\n* get_started\n    - utter_get_started',
                    storyGroupId: groupId,
                    projectId,
                });
            }
        },
    );
};


Meteor.methods({
    'storyGroups.delete'(storyGroup) {
        check(storyGroup, Object);
        return StoryGroups.remove(storyGroup);
    },

    'storyGroups.insert'(storyGroup) {
        check(storyGroup, Object);
        return StoryGroups.insert(storyGroup);
    },

    'storyGroups.update'(storyGroup) {
        check(storyGroup, Object);
        return StoryGroups.update({ _id: storyGroup._id }, { $set: storyGroup });
    },
});
