import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';
import { auditLogIfOnServer } from '../../lib/utils';
import { StoryGroups } from './storyGroups.collection';
import { Projects } from '../project/project.collection';
import { Stories } from '../story/stories.collection';
import { deleteResponsesRemovedFromStories } from '../graphql/botResponses/mongo/botResponses';

export const createStoriesWithTriggersGroup = (projectId) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    checkIfCan('projects:w');
    Meteor.call(
        'storyGroups.insert',
        {
            name: 'Stories with triggers',
            projectId,
            smartGroup: { prefix: 'withTriggers', query: '{ "rules.0.payload": { "$exists": true } }' },
            isExpanded: true,
            pinned: true,
        },
    );
};


export const createUnpublishedStoriesGroup = (projectId) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    checkIfCan('projects:w');
    Meteor.call(
        'storyGroups.insert',
        {
            name: 'Unpublished stories',
            projectId,
            smartGroup: { prefix: 'unpublish', query: '{ "status": "unpublished" }' },
            isExpanded: false,
            pinned: true,
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
        (err, storyGroupId) => {
            if (!err) {
                Meteor.call('stories.insert', {
                    story: '* chitchat.greet\n    - utter_hi',
                    title: 'Greetings',
                    storyGroupId,
                    projectId,
                    events: ['utter_hi'],
                    status: 'published',
                });
                Meteor.call('stories.insert', {
                    story: '* chitchat.bye\n    - utter_bye',
                    title: 'Farewells',
                    storyGroupId,
                    projectId,
                    events: ['utter_bye'],
                    status: 'published',
                });
                Meteor.call('stories.insert', {
                    story: '* get_started\n    - utter_get_started',
                    title: 'Get started',
                    storyGroupId,
                    projectId,
                    events: ['utter_get_started'],
                    status: 'published',
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
        const eventstoRemove = Stories.find({ storyGroupId: storyGroup._id }, { fields: { events: true } })
            .fetch()
            .reduce((acc, { events = [] }) => [...acc, ...events], []);
        Projects.update(
            { _id: storyGroup.projectId },
            { $pull: { storyGroups: storyGroup._id } },
        );
        StoryGroups.remove({ _id: storyGroup._id });
        const result = Stories.remove({ storyGroupId: storyGroup._id });
        deleteResponsesRemovedFromStories(eventstoRemove, storyGroup.projectId);
        auditLogIfOnServer('Story group deleted', {
            resId: storyGroup._id,
            user: Meteor.user(),
            projectId: storyGroup.projectId,
            type: 'deleted',
            operation: 'story-group-deleted',
            before: { storyGroup },
            resType: 'story-group',
        });
        return result;
    },

    'storyGroups.insert'(storyGroup) {
        checkIfCan('stories:w', storyGroup.projectId);
        check(storyGroup, Object);
        const { projectId, pinned } = storyGroup;
        try {
            const id = StoryGroups.insert({
                ...storyGroup, children: [],
            });
            const $position = pinned ? 0 : StoryGroups.find({ projectId, pinned: true }).count();
            Projects.update(
                { _id: projectId },
                { $push: { storyGroups: { $each: [id], $position } } },
            );
            auditLogIfOnServer('Created a story group', {
                resId: id,
                user: Meteor.user(),
                projectId: storyGroup.projectId,
                type: 'created',
                operation: 'story-group-created',
                after: { storyGroup },
                resType: 'story-group',
            });
            return id;
        } catch (e) {
            return handleError(e);
        }
    },

    'storyGroups.update'(storyGroup) {
        checkIfCan('stories:w', storyGroup.projectId);
        check(storyGroup, Object);
        try {
            const { _id, ...rest } = storyGroup;
            const fields = Object.keys(rest).reduce((acc, curr) => ({ ...acc, [curr]: 1 }), {});
            const storyGroupBefore = StoryGroups.findOne({ _id }, { fields });
            if (_id === 'root') {
                const { projectId, children } = rest;
                return Projects.update(
                    { _id: projectId },
                    { $set: { storyGroups: children } },
                );
            }
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
                { _id }, { $set: rest },
            );
        } catch (e) {
            return handleError(e);
        }
    },

    'storyGroups.setExpansion'(storyGroup) {
        checkIfCan('stories:r', storyGroup.projectId);
        check(storyGroup, Object);
        try {
            const { _id, isExpanded } = storyGroup;
            return StoryGroups.update(
                { _id }, { $set: { isExpanded } },
            );
        } catch (e) {
            return handleError(e);
        }
    },
});
