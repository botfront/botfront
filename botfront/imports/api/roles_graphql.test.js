import gql from 'graphql-tag';
import { expect } from 'chai';

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// resolvers
import BotResponseResolver from './graphql/botResponses/resolvers/botResponsesResolver';
import activityResolver from './graphql/activity/resolvers/activityResolver';
import nlgResolver from './graphql/botResponses/resolvers/nlgResolver';

import intentFrequenciesResolvers from './graphql/conversations/resolvers/intentFrequenciesResolver';
import conversationsResolvers from './graphql/conversations/resolvers/conversationsResolver';
import conversationLengthsResolvers from './graphql/conversations/resolvers/conversationLengthsResolver';
import conversationDurationResolvers from './graphql/conversations/resolvers/conversationDurationsResolver';
import conversationCountsResolvers from './graphql/conversations/resolvers/conversationCountsResolver';
import actionCountsResolvers from './graphql/conversations/resolvers/actionCountsResolver';

import entityDistributionResolver from './graphql/nlu/resolvers/entityDistributionResolver';
import nluStatisticsResolver from './graphql/nlu/resolvers/nluStatisticsResolver';
import intentDistributionResolver from './graphql/nlu/resolvers/intentDistributionResolver';

import rolesDataResolver from './graphql/rolesData/resolvers/rolesDataResolver';

import { setScopes } from '../lib/scopes';
import { GlobalSettings } from './globalSettings/globalSettings.collection';
import { Roles } from './roles/roles.publication';
import { Projects } from './project/project.collection';
import { Conversations } from './conversations';
import { setUpRoles } from './roles/roles';

setUpRoles(); // setting up the roles manually prevents errors from happening during the role assignment

const userId = 'testuserid';
const projectId = 'bf';
const projectData = {
    _id: projectId,
    disabled: false,
    name: 'trial',
    namespace: 'bf-trial',
    defaultLanguage: 'en',
    defaultDomain: {
        content:
            'slots:\n  disambiguation_message:\n    type: unfeaturized\nactions:\n  - action_botfront_disambiguation\n  - action_botfront_disambiguation_followup\n  - action_botfront_fallback\n  - action_botfront_mapping',
    },
    nluThreshold: 0.75,
    timezoneOffset: 0,
    nlu_models: ['bfModel'],
    updatedAt: '2020-02-18T16:44:24.809Z',
    deploymentEnvironments: [],
};

const formatRoles = (roles, project) => ({ roles: [{ roles, project }] });

const roles = [
    'nlu-data:r',
    'nlu-data:w',
    'nlu-model:r',
    'nlu-model:w',
    'nlu-model:x',
    'responses:r',
    'responses:w',
    'stories:r',
    'stories:w',
    'triggers:r',
    'triggers:w',
    'incoming:r',
    'incoming:w',
    'analytics:r',
    'projects:r',
    'projects:w',
    'global-settings:r',
    'global-settings:w',
    'roles:r',
    'roles:w',
    'users:r',
    'users:w',
    'global-admin',
];
const subscriptions = [
    'botResponseAdded',
    'botResponsesModified',
    'botResponseDeleted',
];

const readers = {
    nluData: [
        'nlu-data:r',
        'nlu-data:w',
        'nlu-model:r',
        'nlu-model:w',
        'stories:r',
        'stories:w',
        'triggers:r',
        'triggers:w',
        'incoming:r',
        'incoming:w',
        'analytics:r',
        'global-admin',
        'projects:w',
        'projects:r',
    ],
    responses: [
        'responses:r',
        'responses:w',
        'stories:r',
        'stories:w',
        'triggers:r',
        'triggers:w',
        'incoming:r',
        'incoming:w',
        'analytics:r',
        'global-admin',
        'projects:r',
        'projects:w',
    ],
    incoming: [
        'incoming:r',
        'incoming:w',
        'analytics:r',
        'global-admin',
        'projects:r',
        'projects:w',
    ],
    analytics: [
        'analytics:r',
        'global-admin',
        'projects:r',
        'projects:w',
    ],
    roles: [
        'roles:r',
        'roles:w',
        'users:w',
        'global-admin',
    ],
};

const writers = {
    responses: [
        'responses:w',
        'global-admin',
    ],
    analytics: [
        'incoming:w',
        'global-admin',
    ],
    activity: [
        'nlu-data:w',
        'nlu-model:w',
        'incoming:w',
        'global-admin',
    ],
    incoming: [
        'incoming:w',
        'global-admin',
    ],
    roles: [
        'roles:w',
        'global-admin',
    ],
};

const testCases = [
    {
        name: 'botResponses',
        query: BotResponseResolver.Query.botResponses,
        args: { projectId: 'bf' },
        acceptedRoles: readers.responses,
    },
    {
        name: 'botResponse',
        query: BotResponseResolver.Query.botResponse,
        args: { projectId: 'bf' },
        acceptedRoles: readers.responses,
    },
    {
        name: 'botResponseById',
        query: BotResponseResolver.Query.botResponseById,
        args: { projectId: 'bf' },
        acceptedRoles: readers.responses,
    },
    {
        name: 'deleteResponse',
        query: BotResponseResolver.Mutation.deleteResponse,
        args: { projectId: 'bf' },
        acceptedRoles: writers.responses,
    },
    {
        name: 'updateResponse',
        query: BotResponseResolver.Mutation.updateResponse,
        args: { projectId: 'bf' },
        acceptedRoles: writers.responses,
    },
    {
        name: 'upsertResponse',
        query: BotResponseResolver.Mutation.upsertResponse,
        args: { projectId: 'bf' },
        acceptedRoles: writers.responses,
    },
    {
        name: 'createResponse',
        query: BotResponseResolver.Mutation.createResponse,
        args: { projectId: 'bf' },
        acceptedRoles: writers.responses,
    },
    {
        name: 'createResponses',
        query: BotResponseResolver.Mutation.createResponses,
        args: { projectId: 'bf' },
        acceptedRoles: writers.responses,
    },
    {
        name: 'deleteVariation',
        query: BotResponseResolver.Mutation.deleteVariation,
        args: { projectId: 'bf' },
        acceptedRoles: writers.responses,
    },
    {
        name: 'getActivity',
        query: activityResolver.Query.getActivity,
        args: { modelId: 'bfModel' },
        acceptedRoles: readers.incoming,
    },
    {
        name: 'upsert activity from oos',
        query: activityResolver.Mutation.upsertActivity,
        args: { modelId: 'bfModel', data: [], isOoS: true },
        acceptedRoles: writers.activity,
    },
    {
        name: 'upsert activity from incoming',
        query: activityResolver.Mutation.upsertActivity,
        args: { modelId: 'bfModel', data: [] },
        acceptedRoles: writers.analytics,
    },
    {
        name: 'deleteActivity from oos',
        query: activityResolver.Mutation.deleteActivity,
        args: { modelId: 'bfModel', ids: [], isOoS: true },
        acceptedRoles: writers.activity,
    },
    {
        name: 'deleteActivity from incoming',
        query: activityResolver.Mutation.deleteActivity,
        args: { modelId: 'bfModel', ids: [] },
        acceptedRoles: writers.analytics,
    },
    {
        name: 'actionCounts',
        query: actionCountsResolvers.Query.actionCounts,
        args: { projectId: 'bf' },
        acceptedRoles: readers.analytics,
    },
    {
        name: 'conversationCounts',
        query: conversationCountsResolvers.Query.conversationCounts,
        args: { projectId: 'bf' },
        acceptedRoles: readers.analytics,
    },
    {
        name: 'conversationDuration',
        query: conversationDurationResolvers.Query.conversationDurations,
        args: { projectId: 'bf' },
        acceptedRoles: readers.analytics,
    },
    {
        name: 'conversationLengths',
        query: conversationLengthsResolvers.Query.conversationLengths,
        args: { projectId: 'bf' },
        acceptedRoles: readers.analytics,
    },
    {
        name: 'intent frequencies',
        query: intentFrequenciesResolvers.Query.intentFrequencies,
        args: { projectId: 'bf' },
        acceptedRoles: readers.analytics,
    },
    {
        name: 'conversations page',
        query: conversationsResolvers.Query.conversationsPage,
        args: { projectId: 'bf' },
        acceptedRoles: readers.incoming,
    },
    {
        name: 'conversations',
        query: conversationsResolvers.Query.conversation,
        args: { projectId: 'bf' },
        acceptedRoles: readers.incoming,
    },
    {
        name: 'intents in conversations',
        query: conversationsResolvers.Query.intentsInConversations,
        args: { projectId: 'bf' },
        acceptedRoles: readers.incoming,
    },
    {
        name: 'conversations mark as read',
        query: conversationsResolvers.Mutation.markAsRead,
        args: { projectId: 'bf' },
        acceptedRoles: readers.incoming,
    },
    {
        name: 'conversations update status',
        query: conversationsResolvers.Mutation.updateStatus,
        args: { projectId: 'bf' },
        acceptedRoles: writers.incoming,
    },
    {
        name: 'conversations',
        query: conversationsResolvers.Mutation.delete,
        args: { projectId: 'bf' },
        acceptedRoles: writers.incoming,
    },
    {
        name: 'entity distibution',
        query: entityDistributionResolver.Query.entityDistribution,
        args: { projectId: 'bf' },
        acceptedRoles: readers.analytics,
    },
    {
        name: 'getIntentStatistics',
        query: nluStatisticsResolver.Query.getIntentStatistics,
        args: { projectId: 'bf' },
        acceptedRoles: readers.nluData,
    },
    {
        name: 'intent distibution',
        query: intentDistributionResolver.Query.intentDistribution,
        args: { projectId: 'bf' },
        acceptedRoles: readers.analytics,
    },
    {
        name: 'get roles data',
        query: rolesDataResolver.Query.getRolesData,
        args: {},
        acceptedRoles: readers.roles,
        rejectProjectScope: true,
    },
    {
        name: 'upsert roles data',
        query: rolesDataResolver.Mutation.upsertRolesData,
        args: {},
        acceptedRoles: writers.roles,
        rejectProjectScope: true,
    },
];

const setUserScopes = async (userRoles, scope) => {
    await setScopes(formatRoles(userRoles, scope), userId);
};

const createTestUser = async () => {
    await Meteor.users.remove({ _id: 'testuserid' });
    await Meteor.users.insert({
        _id: 'testuserid',
        services: {
            password: {
                bcrypt:
                    '$2a$10$YZwBKpTo03dZLlR1sZyCyeni3..3kAcVwG7EIZ.P0e/o6P2weEqEu',
            },
            resume: {
                loginTokens: [
                    {
                        when: '2020-02-18T16:42:18.967Z',
                        hashedToken: 'oAd1ARWfrH+OWOAWfeBRgrJ8xUS++jwcDETewvEC/uA=',
                    },
                ],
            },
        },
        emails: [{ address: 'test@test.com', verified: false }],
        profile: { firstName: 'test', lastName: 'test' },
    });
};
const deleteTestUser = async () => {
    await Meteor.users.remove({ _id: 'testuserid' });
    await Meteor.roleAssignment.remove({ user: { _id: userId } });
};

const createProject = async () => {
    await Projects.insert(projectData);
};
const deleteProject = async () => {
    await Projects.remove({ _id: 'bf' });
};

const testQl = async (testfunc, role, scope, args) => {
    try {
        await deleteTestUser();
        await deleteProject();
        await createTestUser();
        await createProject();
        await setUserScopes(role, scope);
        console.log('setup complete');
        const result = testfunc({}, args, { user: { _id: 'testuserid' } });
        return result;
    } catch (e) {
        console.log(e);
        return e;
    }
};

describe('zz graphQL Roles', () => {
    testCases.forEach((endpoint) => {
        roles.forEach((role) => {
            it(`call ${endpoint.name} ${role} with a global scope`, (done) => {
                testQl(endpoint.query, role, 'GLOBAL', endpoint.args)
                    .then((result) => {
                        console.log('resolved');
                        if (endpoint.acceptedRoles.includes(role)) {
                            expect((result || {}).error).to.not.equal('403');
                        } else {
                            expect((result || {}).error).to.be.equal('403');
                        }
                        done();
                    })
                    .catch((result) => {
                        console.log('rejected');
                        if (endpoint.acceptedRoles.includes(role)) {
                            expect((result || {}).error).to.not.equal('403');
                        } else {
                            expect((result || {}).error).to.be.equal('403');
                        }
                        done();
                    });
            });
            it(`call ${endpoint.name} ${role} with the right project scope`, (done) => {
                testQl(endpoint.query, role, 'bf', endpoint.args)
                    .then((result) => {
                        console.log('resolved');
                        if (endpoint.acceptedRoles.includes(role) && !endpoint.rejectProjectScope) {
                            expect((result || {}).error).to.not.equal('403');
                        } else {
                            expect((result || {}).error).to.be.equal('403');
                        }
                        done();
                    })
                    .catch((result) => {
                        console.log('rejected');
                        if (endpoint.acceptedRoles.includes(role) && !endpoint.rejectProjectScope) {
                            expect((result || {}).error).to.not.equal('403');
                        } else {
                            expect((result || {}).error).to.be.equal('403');
                        }
                        done();
                    });
            });
            it(`call ${endpoint.name} ${role} with the wrong scope`, (done) => {
                testQl(endpoint.query, role, 'DNE', endpoint.args)
                    .then((result) => {
                        console.log('resolved');
                        expect((result || {}).error).to.be.equal('403');
                        done();
                    })
                    .catch((result) => {
                        console.log('rejected');
                        expect((result || {}).error).to.be.equal('403');
                        done();
                    });
            });
        });
    });
});
