import { Meteor } from 'meteor/meteor';

if (Meteor.isServer) {
    import { expect } from 'chai';
    import { setScopes } from '../../../lib/scopes';
    import { Projects } from '../../project/project.collection';
    import { Conversations } from '../../conversations';

    import {
        roles, readers, writers, otherRoles, formatRoles,
    } from './roleTestUtils';

    import '../../project/project.methods';
    import '../../nlu_model/nlu_model.methods';
    import { NLUModels } from '../../nlu_model/nlu_model.collection';
    import '../../importExport/import.methods';
    import '../../importExport/export.methods';
    import '../../endpoints/endpoints.methods';
    import '../../globalSettings/globalSettings.methods';
    import '../../instances/instances.collection';
    import '../../instances/instances.methods';
    import '../../setup';
    import '../../slots/slots.methods';
    import '../../story/stories.methods';
    import '../../storyGroups/storyGroups.methods';
    import '../../user/user.methods';

    // eslint-disable-next-line import/named
    import { setUpRoles } from '../roles';

    setUpRoles();

    const projectId = 'bf';
    const modelId = 'bfModel';
    const userId = 'testuserid';
    const language = 'en';

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
    name: string, name of the meteor method to call
    args: array, passed as the second argument of the resolver function
    roles: array, roles that are expected to pass the permission check
*/
    const methods = [
        {
            name: 'conversations.markAsRead',
            roles: readers.incoming,
            before: async (done) => {
                await NLUModels.remove({ _id: modelId });
                done();
            },
            args: ['senderId'],
        },
        {
            name: 'conversations.updateStatus',
            roles: readers.incoming,
            args: ['senderId'],
        },
        {
            name: 'conversations.delete',
            roles: writers.incoming,
            args: ['senderId'],
        },
        {
            name: 'policies.save',
            roles: writers.stories,
            args: [{ projectId }],
        },
        {
            name: 'policies.connectHandoff',
            roles: writers.stories,
            args: [projectId, '', ''],
        },
        {
            name: 'credentials.save',
            roles: writers.projects,
            args: [{ projectId }],
        },
        {
            name: 'endpoints.save',
            roles: writers.resources,
            args: [{ projectId }],
        },
        {
            name: 'actionsEndpoints.save',
            roles: writers.projects,
            args: [projectId],
        },
        {
            name: 'settings.save',
            roles: writers.globalSettings,
            args: [],
            rejectProjectScope: true,
        },
        {
            name: 'exportProject',
            roles: readers.projects,
            args: [projectId, null],
        },
        {
            name: 'exportRasa',
            roles: readers.projects,
            args: [projectId, {}],
        },
        {
            name: 'importProject',
            roles: writers.projects,
            args: [null, projectId],
        },
        {
            name: 'instance.update',
            roles: writers.resources,
            args: [{ projectId }],
        },
        {
            name: 'rasa.parse',
            roles: readers.nluData,
            args: [{ projectId }],
        },
        {
            name: 'rasa.getTrainingPayload',
            roles: [...otherRoles.nluDataX, ...readers.projects],
            args: [projectId],
        },
        {
            name: 'rasa.train',
            roles: otherRoles.nluDataX,
            args: [projectId],
        },
        {
            name: 'rasa.evaluate.nlu',
            roles: otherRoles.nluDataX,
            args: [projectId, null, null],
        },
        {
            name: 'nlu.upsertEntitySynonym',
            roles: writers.nluData,
            before: async (done) => {
                await NLUModels.remove({ _id: modelId });
                await NLUModels.insert({ _id: modelId, projectId, language });
                done();
            },
            after: async (done) => {
                await NLUModels.remove({ _id: modelId });
                done();
            },
            args: [modelId],
        },
        {
            name: 'nlu.deleteEntitySynonym',
            roles: writers.nluData,
            before: async (done) => {
                await NLUModels.remove({ _id: modelId });
                await NLUModels.insert({ _id: modelId, projectId, language });
                done();
            },
            after: async (done) => {
                await NLUModels.remove({ _id: modelId });
                done();
            },
            args: [modelId],
        },
        {
            name: 'nlu.upsertEntityGazette',
            roles: writers.nluData,
            before: async (done) => {
                await NLUModels.remove({ _id: modelId });
                await NLUModels.insert({ _id: modelId, projectId, language });
                done();
            },
            after: async (done) => {
                await NLUModels.remove({ _id: modelId });
                done();
            },
            args: [modelId],
        },
        {
            name: 'nlu.deleteEntityGazette',
            roles: writers.nluData,
            before: async (done) => {
                await NLUModels.remove({ _id: modelId });
                await NLUModels.insert({ _id: modelId, projectId, language });
                done();
            },
            after: async (done) => {
                await NLUModels.remove({ _id: modelId });
                done();
            },
            args: [modelId],
        },
        {
            name: 'nlu.insert',
            roles: writers.nluData,
            args: [projectId, null],
        },
        {
            name: 'nlu.update.general',
            roles: writers.nluData,
            before: async (done) => {
                await NLUModels.remove({ _id: modelId });
                await NLUModels.insert({ _id: modelId, projectId, language });
                done();
            },
            after: async (done) => {
                await NLUModels.remove({ _id: modelId });
                done();
            },
            args: [modelId],
        },
        {
            name: 'nlu.remove',
            roles: writers.nluData,
            args: [projectId],
        },
        {
            name: 'nlu.addChitChatToTrainingData',
            roles: writers.nluData,
            args: [projectId],
        },
        {
            name: 'nlu.import',
            roles: writers.nluData,
            args: [null, projectId],
        },
        {
            name: 'nlu.chitChatSetup',
            roles: writers.projects,
            args: [],
            rejectProjectScope: true,
        },
        {
            name: 'nlu.saveExampleChanges',
            roles: writers.nluData,
            args: [projectId, language],
        },
        {
            name: 'project.setEnableSharing',
            roles: otherRoles.shareX,
            args: [projectId],
        },
        {
            name: 'project.insert',
            roles: writers.projects,
            args: [],
            rejectProjectScope: true,
        },
        {
            name: 'project.update',
            roles: writers.projects,
            args: [{ _id: projectId, deploymentEnvironments: [] }],
        },
        {
            name: 'project.update',
            roles: writers.resources,
            args: [{ _id: projectId, deploymentEnvironments: ['staging'] }],
        },
        {
            name: 'project.delete',
            roles: writers.projects,
            args: [],
            rejectProjectScope: true,
        },
        {
            name: 'project.markTrainingStarted',
            roles: otherRoles.nluDataX,
            args: [projectId],
        },
        {
            name: 'project.markTrainingStopped',
            roles: otherRoles.nluDataX,
            args: [projectId],
        },
        {
            name: 'project.getActions',
            roles: [...readers.nluData, ...readers.responses],
            args: [projectId],
        },
        {
            name: 'project.getDefaultLanguage',
            roles: [...readers.nluData, ...readers.responses],
            args: [projectId],
        },
        {
            name: 'slots.insert',
            roles: writers.stories,
            args: [null, projectId],
        },
        {
            name: 'slots.update',
            roles: writers.stories,
            args: [null, projectId],
        },
        {
            name: 'slots.delete',
            roles: writers.stories,
            args: [null, projectId],
        },
        {
            name: 'slots.getSlots',
            roles: readers.stories,
            args: [projectId],
        },
        {
            name: 'stories.insert',
            roles: writers.stories,
            args: [{ projectId }], // singleton
        },
        {
            name: 'stories.insert',
            roles: writers.stories,
            args: [[{ projectId }]], // aray
        },
        {
            name: 'stories.update',
            roles: writers.stories,
            args: [{ projectId }], // singleton
        },
        {
            name: 'stories.update',
            roles: writers.stories,
            args: [[{ projectId }]], // array
        },
        {
            name: 'stories.delete',
            roles: writers.stories,
            args: [{ projectId }],
        },
        {
            name: 'stories.addCheckpoints',
            roles: writers.stories,
            args: [projectId],
        },
        {
            name: 'stories.removeCheckpoints',
            roles: writers.stories,
            args: [projectId],
        },
        {
            name: 'stories.updateRules',
            roles: writers.triggers,
            args: [projectId],
        },
        {
            name: 'stories.deleteRules',
            roles: writers.triggers,
            args: [projectId],
        },
        {
            name: 'stories.includesResponse',
            roles: readers.stories,
            args: [projectId],
        },
        {
            name: 'storyGroups.delete',
            roles: writers.stories,
            args: [{ projectId }],
        },
        {
            name: 'storyGroups.insert',
            roles: writers.stories,
            args: [{ projectId }],
        },
        {
            name: 'storyGroups.update',
            roles: writers.stories,
            args: [{ projectId }],
        },
        {
            name: 'storyGroups.setExpansion',
            roles: readers.stories,
            args: [{ projectId }],
        },
        {
            name: 'user.create',
            roles: writers.users,
            args: [{ roles: [{ project: 'bf' }] }],
        },
        {
            name: 'user.update',
            roles: writers.users,
            args: [{ roles: [{ project: 'bf' }] }],
        },
        {
            name: 'user.remove',
            roles: writers.users,
            args: ['secondtestuserid'],
            before: async (done) => {
                await Meteor.users.remove({ _id: 'secondtestuserid' });
                await Meteor.roleAssignment.remove({ user: { _id: userId } });
                await Meteor.users.insert({
                    _id: 'secondtestuserid',
                    services: {},
                    emails: [{ address: 'secondtest@test.com', verified: false }],
                    profile: { firstName: 'test', lastName: 'test' },
                });
                await setScopes(formatRoles('responses:r', 'bf'), 'secondtestuserid');
                done();
            },
            after: async (done) => {
                await Meteor.users.remove({ _id: 'secondtestuserid' });
                await Meteor.roleAssignment.remove({ user: { _id: 'secondtestuserid' } });
                done();
            },
        },
        {
            name: 'user.removeByEmail',
            roles: writers.users,
            args: [],
            rejectProjectScope: true,
        },
        {
            name: 'user.changePassword',
            roles: writers.users,
            args: ['secondtestuserid'],
            before: async (done) => {
                await Meteor.users.remove({ _id: 'secondtestuserid' });
                await Meteor.roleAssignment.remove({ user: { _id: userId } });
                await Meteor.users.insert({
                    _id: 'secondtestuserid',
                    services: {},
                    emails: [{ address: 'secondtest@test.com', verified: false }],
                    profile: { firstName: 'test', lastName: 'test' },
                });
                await setScopes(formatRoles('responses:r', 'bf'), 'secondtestuserid');
                done();
            },
            after: async (done) => {
                await Meteor.users.remove({ _id: 'secondtestuserid' });
                await Meteor.roleAssignment.remove({ user: { _id: 'secondtestuserid' } });
                done();
            },
        },
        {
            name: 'upload.image',
            roles: writers.responses,
            args: [projectId],
        },
        {
            name: 'delete.image',
            roles: writers.responses,
            args: [projectId],
        },
        {
            name: 'getIntegrationLinks',
            roles: writers.projects,
            args: [projectId],
        },
        {
            name: 'getRestartRasaWebhook',
            roles: writers.projects,
            args: [projectId],
        },
        {
            name: 'stories.changeStatus',
            roles: writers.stories,
            args: [projectId, 'unpublished', 'published'],
        },
        {
            name: 'getDeploymentWebhook',
            roles: writers.projects,
            args: [projectId],
        },
        {
            name: 'global.rebuildIndexes',
            roles: ['global-admin'],
            rejectProjectScope: true,
        },
        {
            name: 'settings.getMigrationStatus',
            roles: ['global-admin'],
            rejectProjectScope: true,
        },
        {
            name: 'settings.unlockMigration',
            roles: ['global-admin'],
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
            services: {},
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
    const addConversation = async () => {
        await Conversations.insert({
            _id: 'senderId',
            projectId: 'bf',
        });
    };
    const removeConversation = async () => {
        await Conversations.remove({ _id: 'senderId' });
    };
    
    const testMethod = async (method, role, scope, args, callback) => {
        try {
            await deleteTestUser();
            await deleteProject();
            await removeConversation();
            await createTestUser();
            await createProject();
            await addConversation();
            await setUserScopes(role, scope);
            Meteor.apply(method, args, callback);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log(e);
        }
    };

    describe('check roles accepted by every method', () => {
        methods.forEach((method) => {
            beforeEach((done) => {
                if (method.before) {
                    method.before(done);
                } else done();
            });
            afterEach((done) => {
                if (method.after) {
                    method.after(done);
                } else done();
            });
            roles.forEach((role) => {
                it(`calling ${method.name} as ${role} global scope`, (done) => {
                    testMethod(method.name, role, 'GLOBAL', method.args, (e = {}) => {
                        if (method.roles.includes(role)) {
                            expect(e.error).to.not.equal('403');
                        } else {
                            expect(e.error).to.be.equal('403');
                        }
                        done();
                    });
                });
                it(`calling ${method.name} as ${role} project scope`, (done) => {
                    testMethod(method.name, role, 'bf', method.args, (e = {}) => {
                        if (method.roles.includes(role) && !method.rejectProjectScope) {
                            expect(e.error).to.not.equal('403');
                        } else {
                            expect(e.error).to.be.equal('403');
                        }
                        done();
                    });
                });
                it(`calling ${method.name} as ${role} wrong project scope`, (done) => {
                    testMethod(method.name, role, 'DNE', method.args, (e = {}) => {
                        expect(e.error).to.be.equal('403');
                        done();
                    });
                });
            });
        });
    });
}
