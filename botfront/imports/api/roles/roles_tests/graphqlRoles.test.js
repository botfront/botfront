
import { Meteor } from 'meteor/meteor';

if (Meteor.isServer) {
// resolvers
    import { expect } from 'chai';
    import BotResponseResolver from '../../graphql/botResponses/resolvers/botResponsesResolver';
    import activityResolver from '../../graphql/activity/resolvers/activityResolver';

    import intentFrequenciesResolvers from '../../graphql/conversations/resolvers/intentFrequenciesResolver';
    import conversationsResolvers from '../../graphql/conversations/resolvers/conversationsResolver';
    import conversationLengthsResolvers from '../../graphql/conversations/resolvers/conversationLengthsResolver';
    import conversationDurationResolvers from '../../graphql/conversations/resolvers/conversationDurationsResolver';
    import conversationCountsResolvers from '../../graphql/conversations/resolvers/conversationCountsResolver';
    import actionCountsResolvers from '../../graphql/conversations/resolvers/actionCountsResolver';

    import examplesResolver from '../../graphql/examples/resolvers/examplesResolver';
    import entityDistributionResolver from '../../graphql/examples/resolvers/entityDistributionResolver';
    import intentDistributionResolver from '../../graphql/examples/resolvers/intentDistributionResolver';

    import analyticsDashboardResolver from '../../graphql/analyticsDashboards/analyticsDashboardResolver';

    import rolesDataResolver from '../../graphql/rolesData/resolvers/rolesDataResolver';

    import storiesResolver from '../../graphql/story/resolvers/storiesResolver';

    import formsResolver from '../../graphql/forms/formResolver';


    import { setScopes } from '../../../lib/scopes';
    import { Projects } from '../../project/project.collection';
    import {
        roles, readers, writers, formatRoles,
    } from './roleTestUtils';

    // eslint-disable-next-line import/named
    import { setUpRoles } from '../roles';

    setUpRoles();
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
            // eslint-disable-next-line max-len
            'slots:\n  disambiguation_message:\n    type: unfeaturized\nactions:\n  - action_botfront_disambiguation\n  - action_botfront_disambiguation_followup\n  - action_botfront_fallback\n  - action_botfront_mapping',
        },
        nluThreshold: 0.75,
        timezoneOffset: 0,
        updatedAt: '2020-02-18T16:44:24.809Z',
        deploymentEnvironments: [],
    };


    /*
    name: string, query name to put in the test tile (only for readability)
    query: function, resolver function to call
    args: obect, passed as the second argument of the resolver function
    acceptedRoles: array, roles that are expected to pass the permission check
*/
    const testCases = [
        {
            name: 'botResponses',
            query: BotResponseResolver.Query.botResponses,
            args: { projectId },
            acceptedRoles: readers.responses,
        },
        {
            name: 'botResponse',
            query: BotResponseResolver.Query.botResponse,
            args: { projectId },
            acceptedRoles: readers.responses,
        },
        {
            name: 'botResponseById',
            query: BotResponseResolver.Query.botResponseById,
            args: { projectId },
            acceptedRoles: readers.responses,
        },
        {
            name: 'deleteResponse',
            query: BotResponseResolver.Mutation.deleteResponse,
            args: { projectId },
            acceptedRoles: writers.responses,
        },
        {
            name: 'upsertFullResponse',
            query: BotResponseResolver.Mutation.upsertFullResponse,
            args: { projectId },
            acceptedRoles: writers.responses,
        },
        {
            name: 'upsertResponse',
            query: BotResponseResolver.Mutation.upsertResponse,
            args: { projectId },
            acceptedRoles: writers.responses,
        },
        {
            name: 'createResponses',
            query: BotResponseResolver.Mutation.createResponses,
            args: { projectId },
            acceptedRoles: writers.responses,
        },
        {
            name: 'deleteVariation',
            query: BotResponseResolver.Mutation.deleteVariation,
            args: { projectId },
            acceptedRoles: writers.responses,
        },
        {
            name: 'getActivity from oos',
            query: activityResolver.Query.getActivity,
            args: { projectId, ooS: true },
            acceptedRoles: readers.nluData,
        },
        {
            name: 'getActivity from incoming',
            query: activityResolver.Query.getActivity,
            args: { projectId },
            acceptedRoles: readers.incoming,
        },
        {
            name: 'upsert activity from oos',
            query: activityResolver.Mutation.upsertActivity,
            args: { projectId, data: [], isOoS: true },
            acceptedRoles: writers.nluData,
        },
        {
            name: 'upsert activity from incoming',
            query: activityResolver.Mutation.upsertActivity,
            args: { projectId, data: [] },
            acceptedRoles: writers.incoming,
        },
        {
            name: 'deleteActivity from oos',
            query: activityResolver.Mutation.deleteActivity,
            args: { projectId, ids: [], isOoS: true },
            acceptedRoles: writers.nluData,
        },
        {
            name: 'deleteActivity from incoming',
            query: activityResolver.Mutation.deleteActivity,
            args: { projectId, ids: [] },
            acceptedRoles: writers.incoming,
        },
        {
            name: 'listDashboards',
            query: analyticsDashboardResolver.Query.listDashboards,
            args: { projectId },
            acceptedRoles: readers.analytics,
        },
        {
            name: 'updateDashboard',
            query: analyticsDashboardResolver.Mutation.updateDashboard,
            args: { projectId },
            acceptedRoles: writers.analytics,
        },
        {
            name: 'actionCounts',
            query: actionCountsResolvers.Query.actionCounts,
            args: { projectId },
            acceptedRoles: readers.analytics,
        },
        {
            name: 'conversationCounts',
            query: conversationCountsResolvers.Query.conversationCounts,
            args: { projectId },
            acceptedRoles: readers.analytics,
        },
        {
            name: 'conversationDuration',
            query: conversationDurationResolvers.Query.conversationDurations,
            args: { projectId },
            acceptedRoles: readers.analytics,
        },
        {
            name: 'conversationLengths',
            query: conversationLengthsResolvers.Query.conversationLengths,
            args: { projectId },
            acceptedRoles: readers.analytics,
        },
        {
            name: 'intent frequencies',
            query: intentFrequenciesResolvers.Query.intentFrequencies,
            args: { projectId },
            acceptedRoles: readers.analytics,
        },
        {
            name: 'conversations page',
            query: conversationsResolvers.Query.conversationsPage,
            args: { projectId },
            acceptedRoles: readers.incoming,
        },
        {
            name: 'conversations',
            query: conversationsResolvers.Query.conversation,
            args: { projectId },
            acceptedRoles: readers.incoming,
        },
        {
            name: 'intents in conversations',
            query: conversationsResolvers.Query.intentsInConversations,
            args: { projectId },
            acceptedRoles: readers.incoming,
        },
        {
            name: 'conversations mark as read',
            query: conversationsResolvers.Mutation.markAsRead,
            args: { projectId },
            acceptedRoles: readers.incoming,
        },
        {
            name: 'conversations update status',
            query: conversationsResolvers.Mutation.updateStatus,
            args: { projectId },
            acceptedRoles: writers.incoming,
        },
        {
            name: 'conversations',
            query: conversationsResolvers.Mutation.delete,
            args: { projectId },
            acceptedRoles: writers.incoming,
        },
        {
            name: 'entity distibution',
            query: entityDistributionResolver.Query.entityDistribution,
            args: { projectId },
            acceptedRoles: readers.analytics,
        },
        {
            name: 'getIntentStatistics',
            query: examplesResolver.Query.getIntentStatistics,
            args: { projectId },
            acceptedRoles: readers.nluData,
        },
        {
            name: 'intent distibution',
            query: intentDistributionResolver.Query.intentDistribution,
            args: { projectId },
            acceptedRoles: readers.analytics,
        },
        {
            name: 'get roles data',
            query: rolesDataResolver.Query.getRolesData,
            args: {},
            acceptedRoles: readers.roles,
            acceptWrongProjectScope: true,
        },
        {
            name: 'upsert roles data',
            query: rolesDataResolver.Mutation.upsertRolesData,
            args: {},
            acceptedRoles: writers.roles,
            acceptWrongProjectScope: true,
        },
        {
            name: 'delete roles data',
            query: rolesDataResolver.Mutation.deleteRolesData,
            args: {},
            acceptedRoles: writers.roles,
            acceptWrongProjectScope: true,
        },
        {
            name: 'search stories',
            query: storiesResolver.Query.storiesSearch,
            args: { projectId },
            acceptedRoles: readers.stories,
        },
        {
            name: 'get forms',
            query: formsResolver.Query.getForms,
            args: { projectId },
            acceptedRoles: readers.stories,
        },
        {
            name: 'upsert form',
            query: formsResolver.Mutation.upsertForm,
            args: { form: { projectId } },
            acceptedRoles: writers.stories,
        },
        {
            name: 'deleteForms',
            query: formsResolver.Mutation.deleteForms,
            args: { projectId },
            acceptedRoles: writers.stories,
        },
        {
            name: 'updateExamples',
            query: examplesResolver.Mutation.updateExamples,
            args: { projectId },
            acceptedRoles: writers.nluData,
        },
        {
            name: 'insertExamples',
            query: examplesResolver.Mutation.insertExamples,
            args: { projectId },
            acceptedRoles: writers.nluData,
        },
        {
            name: 'deleteExamples',
            query: examplesResolver.Mutation.deleteExamples,
            args: { projectId },
            acceptedRoles: writers.nluData,
        },
        {
            name: 'switchCanonical',
            query: examplesResolver.Mutation.switchCanonical,
            args: { projectId },
            acceptedRoles: writers.nluData,
        },
        {
            name: 'examples',
            query: examplesResolver.Query.examples,
            args: { projectId },
            acceptedRoles: readers.nluData,
        },
        {
            name: 'getIntentStatistics',
            query: examplesResolver.Query.getIntentStatistics,
            args: { projectId },
            acceptedRoles: readers.nluData,
        },
        {
            name: 'listIntentsAndEntities',
            query: examplesResolver.Query.listIntentsAndEntities,
            args: { projectId },
            acceptedRoles: readers.nluData,
        },
        
    ];

    if (Meteor.isServer) {
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
                const result = testfunc({}, args, { user: { _id: 'testuserid' } });
                return result;
            } catch (e) {
                // eslint-disable-next-line no-console
                if (!e || e.error !== '403') console.log(e);
                return e;
            }
        };

        describe('graphQL Roles', () => {
            testCases.forEach((endpoint) => {
                roles.forEach((role) => {
                    it(`call ${endpoint.name} ${role} with a global scope`, (done) => {
                        testQl(endpoint.query, role, 'GLOBAL', endpoint.args)
                            .then((result) => {
                                if (endpoint.acceptedRoles.includes(role)) {
                                    expect((result || {}).error).to.not.equal('403');
                                } else {
                                    expect((result || {}).error).to.be.equal('403');
                                }
                                done();
                            })
                            .catch((result) => {
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
                                if (endpoint.acceptedRoles.includes(role) && !endpoint.rejectProjectScope) {
                                    expect((result || {}).error).to.not.equal('403');
                                } else {
                                    expect((result || {}).error).to.be.equal('403');
                                }
                                done();
                            })
                            .catch((result) => {
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
                                if (endpoint.acceptedRoles.includes(role) && !endpoint.rejectProjectScope) {
                                    expect((result || {}).error).to.not.equal('403');
                                } else {
                                    expect((result || {}).error).to.be.equal('403');
                                }
                                done();
                            })
                            .catch((result) => {
                                if (endpoint.acceptedRoles.includes(role) && endpoint.acceptWrongProjectScope) {
                                    expect((result || {}).error).to.not.equal('403');
                                } else {
                                    expect((result || {}).error).to.be.equal('403');
                                }
                                done();
                            });
                    });
                });
            });
        });
    }
}
