import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';

import { StoryGroups } from './storyGroups.collection';
import { Projects } from '../project/project.collection';
import { Stories } from '../story/stories.collection';
import { deleteResponsesRemovedFromStories } from '../graphql/botResponses/mongo/botResponses';

export const createDefaultStoryGroup = (projectId) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    Meteor.call(
        'storyGroups.insert',
        {
            name: 'Example group',
            projectId,
        },
        (err, storyGroupId) => {
            if (!err) {
                Meteor.call('stories.insert', {
                    type: 'rule',
                    steps: [
                        { intent: 'chitchat.greet' },
                        { action: 'utter_hi' },
                    ],
                    title: 'Greetings',
                    storyGroupId,
                    projectId,
                    events: ['utter_hi'],
                });
                Meteor.call('stories.insert', {
                    type: 'rule',
                    steps: [
                        { intent: 'chitchat.bye' },
                        { action: 'utter_bye' },
                    ],
                    title: 'Farewells',
                    storyGroupId,
                    projectId,
                    events: ['utter_bye'],
                });
                Meteor.call('stories.insert', {
                    type: 'rule',
                    steps: [
                        { intent: 'get_started' },
                        { action: 'utter_get_started' },
                    ],
                    title: 'Get started',
                    storyGroupId,
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

function handleError(e) {
    if (e.code === 11000) {
        throw new Meteor.Error(400, 'Group name already exists');
    }
    throw new Meteor.Error(e.error, e.message);
}

Meteor.methods({
    async 'storyGroups.delete'(storyGroup) {
        check(storyGroup, Object);
        const eventstoRemove = Stories.find(
            { storyGroupId: storyGroup._id },
            { fields: { events: true } },
        )
            .fetch()
            .reduce((acc, { events = [] }) => [...acc, ...events], []);
        Projects.update(
            { _id: storyGroup.projectId },
            { $pull: { storyGroups: storyGroup._id } },
        );
        StoryGroups.remove({ _id: storyGroup._id });
        const result = Stories.remove({ storyGroupId: storyGroup._id });
        deleteResponsesRemovedFromStories(eventstoRemove, storyGroup.projectId);
        return result;
    },

    async 'storyGroups.insert'(storyGroup) {
        check(storyGroup, Object);
        const { projectId, pinned } = storyGroup;
        try {
            const id = StoryGroups.insert({
                ...storyGroup,
                children: [],
            });
            const $position = pinned ? 0 : StoryGroups.find({ projectId, pinned: true }).count();
            Projects.update(
                { _id: projectId },
                { $push: { storyGroups: { $each: [id], $position } } },
            );
            return id;
        } catch (e) {
            return handleError(e);
        }
    },

    'storyGroups.update'(storyGroup) {
        check(storyGroup, Object);
        try {
            const { _id, ...rest } = storyGroup;
            if (_id === 'root') {
                const { projectId, children } = rest;
                return Projects.update(
                    { _id: projectId },
                    { $set: { storyGroups: children } },
                );
            }
            return StoryGroups.update({ _id }, { $set: rest });
        } catch (e) {
            return handleError(e);
        }
    },

    'storyGroups.setExpansion'(storyGroup) {
        checkIfCan('stories:r', storyGroup.projectId);
        check(storyGroup, Object);
        try {
            const { _id, isExpanded } = storyGroup;
            return StoryGroups.update({ _id }, { $set: { isExpanded } });
        } catch (e) {
            return handleError(e);
        }
    },
    async 'storyGroups.rebuildOrder'(projectId) {
        checkIfCan('stories:r', projectId);
        check(projectId, String);
        const { storyGroups: order = [] } = Projects.findOne({ _id: projectId }, { fields: { storyGroups: 1 } });
        const storyGroups = StoryGroups.find({ projectId }, { fields: { _id: 1, pinned: 1, name: 1 } }).fetch();
        
        const newOrder = [...storyGroups]
            .sort((a, b) => order.findIndex(id => id === a._id) - order.findIndex(id => id === b._id))
            .sort((a, b) => !!b.pinned - !!a.pinned)
            .map(({ _id }) => _id);
        
        return Projects.update({ _id: projectId }, { $set: { storyGroups: newOrder } });
    },
});
