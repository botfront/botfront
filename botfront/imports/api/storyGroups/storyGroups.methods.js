import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';
import { auditLogIfOnServer } from '../../lib/utils';
import { StoryGroups } from './storyGroups.collection';
import { Stories } from '../story/stories.collection';
import { deleteResponsesRemovedFromStories } from '../graphql/botResponses/mongo/botResponses';

export const createIntroStoryGroup = (projectId) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    checkIfCan('projects:w');
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
                    events: ['utter_get_started'],
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
    checkIfCan('projects:w');
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
                    events: ['utter_hi'],
                });
                Meteor.call('stories.insert', {
                    story: '* chitchat.bye\n    - utter_bye',
                    title: 'Farewells',
                    storyGroupId: groupId,
                    projectId,
                    events: ['utter_bye'],
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
    async 'storyGroups.delete'(storyGroup) {
        checkIfCan('stories:w', storyGroup.projectId);
        check(storyGroup, Object);
        let eventstoRemove = [];
        const childStories = Stories.find({ storyGroupId: storyGroup._id }, { fields: { events: true } }).fetch();
        childStories.forEach(({ events = [] }) => { eventstoRemove = [...eventstoRemove, ...events]; });
        auditLogIfOnServer('Story group deleted', {
            resId: storyGroup._id,
            user: Meteor.user(),
            projectId: storyGroup.projectId,
            type: 'deleted',
            operation: 'story-group-deleted',
            before: { storyGroup },
            resType: 'story-group',
        });
        const result = await StoryGroups.remove(storyGroup) && await Meteor.callWithPromise('storyGroups.deleteChildStories', storyGroup._id, storyGroup.projectId);
        return result;
    },

    'storyGroups.insert'(storyGroup) {
        checkIfCan('stories:w', storyGroup.projectId);
        check(storyGroup, Object);
        try {
            const result = StoryGroups.insert(storyGroup);
            const after = StoryGroups.findOne({ name: storyGroup.name });
            auditLogIfOnServer('Created a story group', {
                resId: after._id,
                user: Meteor.user(),
                projectId: storyGroup.projectId,
                type: 'created',
                operation: 'story-group-created',
                after: { storyGroup },
                resType: 'story-group',
            });
            return result;
        } catch (e) {
            return handleError(e);
        }
    },

    'storyGroups.update'(storyGroup) {
        checkIfCan('stories:w', storyGroup.projectId);
        check(storyGroup, Object);
        try {
            const storyGroupBefore = StoryGroups.findOne({ _id: storyGroup._id });
            auditLogIfOnServer('Updated a story group', {
                resId: storyGroup._id,
                user: Meteor.user(),
                type: 'updated',
                projectId: storyGroup.projectId,
                operation: 'story-group-updated',
                after: { storyGroup },
                before: { storyGroup: storyGroupBefore },
                resType: 'story-group',
            });
            return StoryGroups.update(
                { _id: storyGroup._id },
                { $set: storyGroup },
            );
        } catch (e) {
            return handleError(e);
        }
    },
    'storyGroups.removeFocus'(projectId) {
        checkIfCan('stories:w', projectId);
        check(projectId, String);
        const storyGroupBefore = StoryGroups.find(
            { projectId }, { fields: { selected: 1, _id: 1 } },
        ).fetch().lean();
        const result = StoryGroups.update(
            { projectId },
            { $set: { selected: false } },
            { multi: true },
        );
        const storyGroupAfter = StoryGroups.find(
            { projectId }, { fields: { selected: 1, _id: 1 } },
        ).fetch().lean();
        auditLogIfOnServer('removed focus on all story group', {
            user: Meteor.user(),
            type: 'updated',
            projectId,
            operation: 'story-group-updated',
            after: { storyGroup: storyGroupAfter },
            before: { storyGroup: storyGroupBefore },
            resType: 'story-group',
        });

        return result;
    },
});

if (Meteor.isServer) {
    Meteor.methods({
        async 'storyGroups.deleteChildStories'(storyGroupId, projectId) {
            checkIfCan('stories:w', projectId);
            check(storyGroupId, String);
            check(projectId, String);
            let eventstoRemove = [];
            const childStories = Stories.find({ storyGroupId }, { fields: { events: true } })
                .fetch();
            childStories.forEach(({ events = [] }) => { eventstoRemove = [...eventstoRemove, ...events]; });
            const storiesBefore = await Stories.find({ storyGroupId }).fetch();
            const result = await Stories.remove({ storyGroupId });
            deleteResponsesRemovedFromStories(eventstoRemove, projectId);

            auditLogIfOnServer('Deleted child stories of a story group', {
                user: Meteor.user(),
                type: 'deleted',
                projectId,
                operation: 'stories-delete',
                resId: storyGroupId,
                before: { stories: storiesBefore },
                resType: 'story-group',
            });
            return result;
        },
    });
}
