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

export const createDefaultStoryGroup = (projectId) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    Meteor.call(
        'storyGroups.insert',
        {
            name: 'Default stories',
            projectId,
        },
        (err, groupId) => {
            if (!err) {
                Meteor.call('stories.insert', {
                    story: '* chitchat.greet\n    - utter_hi',
                    title: 'Greetings',
                    storyGroupId: groupId,
                    projectId,
                });
                Meteor.call('stories.insert', {
                    story: '* chitchat.bye\n    - utter_bye',
                    title: 'Farewells',
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

function handleError(e) {
    if (e.code === 11000) {
        throw new Meteor.Error(400, 'Group name already exists');
    }
    throw new Meteor.Error(500, 'Server Error');
}

Meteor.methods({
    'storyGroups.delete'(storyGroup) {
        check(storyGroup, Object);
        return StoryGroups.remove(storyGroup);
    },

    'storyGroups.insert'(storyGroup) {
        check(storyGroup, Object);
        try {
            return StoryGroups.insert(storyGroup);
        } catch (e) {
            return handleError(e);
        }
    },

    'storyGroups.update'(storyGroup) {
        check(storyGroup, Object);
        try {
            return StoryGroups.update(
                { _id: storyGroup._id },
                { $set: storyGroup },
            );
        } catch (e) {
            return handleError(e);
        }
    },
    'storyGroups.updateExceptions'(storyGroup) {
        check(storyGroup, Object);
        const {
            _id,
            hasError,
            hasWarning,
            storyId,
        } = storyGroup;
        const update = {};
        if (hasError) {
            update.hasErrors = storyId;
        } else {
            update.hasNoErrors = storyId;
        }
        if (hasWarning) {
            update.hasWarnings = storyId;
        } else {
            update.hasNoWarnings = storyId;
        }
        StoryGroups.update(
            { _id },
            {
                $addToSet: { hasErrors: update.hasErrors, hasWarnings: update.hasWarnings },
                $pull: { hasErrors: update.hasNoErrors, hasNoWarnings: update.hasNoWarnings },
            },
        );
    },
    'storyGroups.removeFocus'(projectId) {
        check(projectId, String);
        return StoryGroups.update(
            { projectId },
            { $set: { selected: false } },
            { multi: true },
        );
    },
});
