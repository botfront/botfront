import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';
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

function handleError(e) {
    if (e.code === 11000) {
        throw new Meteor.Error(400, 'Group name already exists');
    }
    throw new Meteor.Error(500, 'Server Error');
}

Meteor.methods({
    'storyGroups.delete'(storyGroup, projectId) {
        check(storyGroup, Object);
        check(projectId, String);
        checkIfCan('stories:w', projectId);
        return StoryGroups.remove({ _id: storyGroup._id });
    },

    'storyGroups.insert'(storyGroup) {
        check(storyGroup, Object);
        checkIfCan('stories:w', storyGroup.projectId);
        try {
            return StoryGroups.insert(storyGroup);
        } catch (e) {
            return handleError(e);
        }
    },

    'storyGroups.update'(storyGroup, projectId) {
        check(storyGroup, Object);
        check(projectId, String);
        checkIfCan('stories:w', projectId);
        try {
            return StoryGroups.update(
                { _id: storyGroup._id },
                { $set: storyGroup },
            );
        } catch (e) {
            return handleError(e);
        }
    },

    'storyGroups.removeFocus'(projectId) {
        check(projectId, String);
        checkIfCan('stories:w', projectId);
        return StoryGroups.update(
            { projectId },
            { $set: { selected: false } },
            { multi: true },
        );
    },
});
