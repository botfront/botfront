import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { StoryGroups } from './storyGroups.collection';

export const createIntroStoryGroup = (projectId) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    Meteor.call(
        'storyGroups.insert',
        {
            name: 'Intro stories',
            projectId,
            introStory: true,
        },
        (err, groupId) => {
            if (!err) {
                Meteor.call('stories.insert', {
                    story: '* get_started\n    - utter_get_started',
                    title: 'Get started',
                    storyGroupId: groupId,
                    projectId,
                });
            } else {
                // eslint-disable-next-line no-console
                console.log(err);
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

    'storyGroups.removeFocus'(projectId) {
        check(projectId, String);
        return StoryGroups.update({ projectId }, { $set: { selected: false } }, { multi: true });
    },
});
