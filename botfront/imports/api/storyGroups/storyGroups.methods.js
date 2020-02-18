import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';
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
        const childStories = Stories.find({ storyGroupId: storyGroup._id }, { fields: { events: true } })
            .fetch();
        childStories.forEach(({ events = [] }) => { eventstoRemove = [...eventstoRemove, ...events]; });

        const result = await StoryGroups.remove(storyGroup) && await Meteor.callWithPromise('storyGroups.deleteChildStories', storyGroup._id, storyGroup.projectId);
        return result;
    },

    'storyGroups.insert'(storyGroup) {
        checkIfCan('stories:w', storyGroup.projectId);
        check(storyGroup, Object);
        try {
            return StoryGroups.insert(storyGroup);
        } catch (e) {
            return handleError(e);
        }
    },

    'storyGroups.update'(storyGroup) {
        checkIfCan('stories:w', storyGroup.projectId);
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
    'storyGroups.removeFocus'(projectId) {
        checkIfCan('stories:w', projectId);
        check(projectId, String);
        return StoryGroups.update(
            { projectId },
            { $set: { selected: false } },
            { multi: true },
        );
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

            const result = await Stories.remove({ storyGroupId });
            deleteResponsesRemovedFromStories(eventstoRemove, projectId);
            return result;
        },
    });
}
