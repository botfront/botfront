import { Meteor } from 'meteor/meteor';

if (Meteor.isServer) {
    import { expect } from 'chai';
    import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
    import { setScopes } from '../../../lib/scopes';
    import { Projects } from '../../project/project.collection';
    import { Conversations } from '../../conversations';

    import {
        roles, readers, writers, formatRoles,
    } from './roleTestUtils';

    import { CorePolicies } from '../../core_policies';
    import { Credentials } from '../../credentials';
    import { Endpoints } from '../../endpoints/endpoints.collection';
    import { GlobalSettings } from '../../globalSettings/globalSettings.collection';
    import { Instances } from '../../instances/instances.collection';
    import { NLUModels } from '../../nlu_model/nlu_model.collection';

    import '../roles.publication';
    import { Slots } from '../../slots/slots.collection';
    import { Stories } from '../../story/stories.collection';
    import { StoryGroups } from '../../storyGroups/storyGroups.collection';
    import { Evaluations } from '../../nlu_evaluation';


    // eslint-disable-next-line import/named
    import { setUpRoles, publishRoles } from '../roles';

    setUpRoles();


    const projectId = 'bf';
    const modelId = 'bfModel';
    const userId = 'testuserid';

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
        nlu_models: [modelId],
        updatedAt: '2020-02-18T16:44:24.809Z',
        deploymentEnvironments: [],
    };

    const partialProjectData = {
        _id: projectId,
        name: 'trial',
        defaultLanguage: 'en',
        disabled: false,
        nlu_models: [modelId],
        updatedAt: '2020-02-18T16:44:24.809Z',
        nluThreshold: 0.75,
    };

    const projectDneData = {
        _id: 'DNE',
        disabled: false,
        name: 'wrongProject',
        namespace: 'bf-wrongProject',
        defaultLanguage: 'en',
        defaultDomain: {
            content:
            // eslint-disable-next-line max-len
            'slots:\n  disambiguation_message:\n    type: unfeaturized\nactions:\n  - action_botfront_disambiguation\n  - action_botfront_disambiguation_followup\n  - action_botfront_fallback\n  - action_botfront_mapping',
        },
        nluThreshold: 0.75,
        timezoneOffset: 0,
        nlu_models: ['DneModel'],
        updatedAt: '2020-02-18T16:44:24.809Z',
        deploymentEnvironments: [],
    };

    const corePoliciesData = {
        _id: 'testCorePolicy',
        projectId,
        policies:
        'policies:\n  #- name: KerasPolicy\n    #epochs: 200\n  - name: FallbackPolicy\n  - name: AugmentedMemoizationPolicy\n  - name: MemoizationPolicy',
        createdAt: '2020-02-24T15:57:22.352Z',
        updatedAt: '2020-02-24T15:57:59.681Z',
    };
    const credentialsData = {
        _id: 'testCredentials',
        projectId,
        environment: 'development',
        credentials:
        'rasa_addons.core.channels.webchat.WebchatInput:\n  session_persistence: true\n  base_url: http://localhost:5005\n  socket_path: \'/socket.io/\'',
        updatedAt: '2020-02-24T15:57:59.654Z',
    };
    const endpointsData = {
        _id: 'testEndpoints',
        endpoints:
        // eslint-disable-next-line max-len
        'nlg:\n  type: \'rasa_addons.core.nlg.GraphQLNaturalLanguageGenerator\'\n  url: \'http://localhost:3000//graphql\'\naction_endpoint:\n  url: \'undefined\'\ntracker_store:\n  store_type: rasa_addons.core.tracker_stores.AnalyticsTrackerStore\n  url: \'http://localhost:8080\'\n  project_id: \'LrGjcZqm9Fjdj3GRP\'',
        projectId,
        environment: 'development',
        updatedAt: '2020-02-24T15:57:59.668Z',
    };
    const globalSettingsData = {
        _id: 'SETTINGS',
        settings: {
            public: {
                defaultNLUConfig:
                // eslint-disable-next-line max-len
                'pipeline:\n  - name: WhitespaceTokenizer\n  - name: CountVectorsFeaturizer\n  - name: EmbeddingIntentClassifier\n  - BILOU_flag: true\n    name: CRFEntityExtractor\n    features:\n      - [low, title, upper]\n      - [low, bias, prefix5, prefix2, suffix5, suffix3, suffix2, upper, title, digit, pattern]\n      - [low, title, upper]\n  - name: rasa_addons.nlu.components.gazette.Gazette\n  - name: EntitySynonymMapper',
                backgroundImages: ['https://source.unsplash.com/collection/315548/2400x1500'],
                docUrl: 'https://botfront.io/docs',
                chitChatProjectId: 'chitchat-JQ2Kbcp-',
            },
            private: {
                rasaServerDefaultUrl: 'http://localhost:5005',
                bfApiHost: 'http://botfront-api:8080',
                defaultEndpoints:
                // eslint-disable-next-line max-len
                'nlg:\n  type: \'rasa_addons.core.nlg.GraphQLNaturalLanguageGenerator\'\n  url: \'{ROOT_URL}/graphql\'\naction_endpoint:\n  url: \'{ACTIONS_URL}\'\ntracker_store:\n  store_type: rasa_addons.core.tracker_stores.AnalyticsTrackerStore\n  url: \'http://localhost:8080\'\n  project_id: \'{BF_PROJECT_ID}\'',
                defaultCredentials:
                'rasa_addons.core.channels.webchat.WebchatInput:\n  session_persistence: true\n  base_url: http://localhost:5005\n  socket_path: \'/socket.io/\'',
                defaultPolicies:
                'policies:\n  #- name: KerasPolicy\n    #epochs: 200\n  - name: FallbackPolicy\n  - name: AugmentedMemoizationPolicy\n  - name: MemoizationPolicy',
                defaultDefaultDomain:
                // eslint-disable-next-line max-len
                'slots:\n  disambiguation_message:\n    type: unfeaturized\nactions:\n  - action_botfront_disambiguation\n  - action_botfront_disambiguation_followup\n  - action_botfront_fallback\n  - action_botfront_mapping',
                webhooks: {
                    restartRasaWebhook: { name: 'RestartRasa', method: 'POST' },
                    uploadImageWebhook: { name: 'UploadImage', method: 'POST' },
                    deleteImageWebhook: { name: 'DeleteImage', method: 'DELETE' },
                    deploymentWebhook: { name: 'DeployProject', method: 'POST' },
                },
            },
        },
        updatedAt: '2020-02-24T22:21:18.825Z',
    };
    const partialGlobalSettingsData = {
        _id: 'SETTINGS',
        settings: {
            public: {
                defaultNLUConfig:
                // eslint-disable-next-line max-len
                'pipeline:\n  - name: WhitespaceTokenizer\n  - name: CountVectorsFeaturizer\n  - name: EmbeddingIntentClassifier\n  - BILOU_flag: true\n    name: CRFEntityExtractor\n    features:\n      - [low, title, upper]\n      - [low, bias, prefix5, prefix2, suffix5, suffix3, suffix2, upper, title, digit, pattern]\n      - [low, title, upper]\n  - name: rasa_addons.nlu.components.gazette.Gazette\n  - name: EntitySynonymMapper',
                backgroundImages: ['https://source.unsplash.com/collection/315548/2400x1500'],
                docUrl: 'https://botfront.io/docs',
                chitChatProjectId: 'chitchat-JQ2Kbcp-',
            },
        },
        updatedAt: '2020-02-24T22:21:18.825Z',
    };

    const nluInstanceData = {
        _id: 'testNluInstance',
        name: 'Default',
        host: 'http://localhost:5005',
        projectId,
        type: 'server',
    };

    const nluModelData = {
        _id: modelId,
        name: 'Default Model',
        language: 'en',
        config:
        // eslint-disable-next-line max-len
        'pipeline:\n  - name: WhitespaceTokenizer\n  - name: CountVectorsFeaturizer\n  - name: EmbeddingIntentClassifier\n  - BILOU_flag: true\n    name: CRFEntityExtractor\n    features:\n      - [low, title, upper]\n      - [low, bias, prefix5, prefix2, suffix5, suffix3, suffix2, upper, title, digit, pattern]\n      - [low, title, upper]\n  - name: rasa_addons.nlu.components.gazette.Gazette\n  - name: EntitySynonymMapper',
        evaluations: [],
        intents: [],
        chitchat_intents: [],
        training_data: {
            common_examples: [],
            entity_synonyms: [],
            regex_features: [],
            fuzzy_gazette: [],
        },
        updatedAt: '2020-02-24T22:21:23.800Z',
    };

    const slotData = {
        _id: 'testSlot',
        type: 'bool',
        initialValue: true,
        projectId: 'bf',
        name: 'test',
    };

    const storyData = {
        _id: 'testStory',
        story: '* get_started\n  - utter_IjPDQTzk',
        title: 'Get started',
        storyGroupId: 'testStoryGroup',
        projectId,
        branches: [],
        events: ['utter_IjPDQTzk'],
        rules: [
            {
                trigger: { when: 'always', timeOnPage: 1 },
                payload: '/trigger_vvpfBvWkX2nfLQYY8',
            },
        ],
    };

    const storyGroupData = {
        _id: 'testStoryGroup',
        name: 'test story group',
        projectId,
        updatedAt: '2020-02-24T22:21:23.742Z',
        selected: false,
        introStory: true,
        hasErrors: [],
        hasWarnings: [],
    };

    const conversationData = {
        _id: 'senderId',
        projectId: 'bf',
    };
    const nluEvaluationData = {
        _id: 'testNluEvaluation',
        results: {
            intent_evaluation: null,
            entity_evaluation: {},
            response_selection_evaluation: null,
        },
        modelId,
        timestamp: '2020-02-25T19:41:56.520Z',
    };
    const globalUserTestData = {
        _id: 'userDataTestA',
        services: {},
        emails: [{ address: 'testglobal@test.com', verified: false }],
        profile: { firstName: 'test', lastName: 'test' },
    };
    const projectUserTestData = {
        _id: 'userDataTestB',
        services: {},
        emails: [{ address: 'testproject@test.com', verified: false }],
        profile: { firstName: 'test', lastName: 'test' },
    };
    const otherProjectUserTestData = {
        _id: 'userDataTestC',
        services: {},
        emails: [{ address: 'testother@test.com', verified: false }],
        profile: { firstName: 'test', lastName: 'test' },
    };
    /*
the tests are created by iterating over subscriptions. the test params are as follows

    name: string, name of the subscription being tested

    collectionName: string, name of the collection the subscription creates cursors for (requried to check if the test was successful)

    testDataInsert: function, called before the test to insert any test data required for this test

    testDataRemove: function, called after the test has run to remove the test data

    args: array, arguments to pass to the subscription

    acceptedRoles: array, expect the subscription to be successful for users with one of these roles

    allowed: function, overide the default expect() statement for accepted roles with a function with args collections and done,

    disallowed: function, overide the default expect() statement for rejected roles with a function to use as the callback in the subscription test function

    rejectProjectScope: boolean, if this is true it will use the disallowed or the default expect() for denied permissions

    allowedWrongProjectScope: function, overide the wrong project scope expect() if the role is in accepted roles
*/

    const subscriptions = [
        {
            name: 'policies',
            collectionName: 'core_policies',
            testDataInsert: async () => {
                await CorePolicies.insert(corePoliciesData);
            },
            testDataRemove: async (done) => {
                await CorePolicies.remove({ _id: 'testCorePolicy' });
                done();
            },
            args: [projectId],
            acceptedRoles: readers.stories,
        },
        {
            name: 'credentials',
            collectionName: 'credentials',
            testDataInsert: async () => {
                await Credentials.insert(credentialsData);
            },
            testDataRemove: async (done) => {
                await Credentials.remove({ _id: 'testCredentials' });
                done();
            },
            args: [projectId],
            acceptedRoles: [...readers.nluData, ...readers.responses, ...readers.projects],
        },
        {
            name: 'conversations',
            collectionName: 'conversations',
            testDataInsert: async () => {
                await Conversations.insert(conversationData);
            },
            testDataRemove: async (done) => {
                await Conversations.remove({ _id: 'senderId' });
                done();
            },
            args: [projectId, 0, 1, 'development'],
            acceptedRoles: readers.incoming,
        },
        {
            name: 'conversation-detail',
            collectionName: 'conversations',
            testDataInsert: async () => {
                await Conversations.insert(conversationData);
            },
            testDataRemove: async (done) => {
                await Conversations.remove({ _id: 'senderId' });
                done();
            },
            args: ['senderId', projectId],
            acceptedRoles: readers.incoming,
        },
        {
            name: 'endpoints',
            collectionName: 'endpoints',
            testDataInsert: async () => {
                await Endpoints.remove({});
                await Endpoints.insert(endpointsData);
            },
            testDataRemove: async (done) => {
                await Endpoints.remove({ _id: 'testEndpoints' });
                done();
            },
            args: [projectId],
            acceptedRoles: readers.projects,
        },
        {
            name: 'settings',
            collectionName: 'admin_settings',
            testDataInsert: async () => {
                await GlobalSettings.insert(globalSettingsData);
            },
            testDataRemove: async (done) => {
                await GlobalSettings.remove({ _id: 'SETTINGS' });
                done();
            },
            args: [],
            acceptedRoles: readers.globalSettings,
            allowed: (result, done) => {
                expect(result.admin_settings[0].settings).to.deep.equal(globalSettingsData.settings);
                done();
            },
            disallowed: (result, done) => {
                expect(result.admin_settings[0].settings).to.deep.equal(partialGlobalSettingsData.settings);
                done();
            },
            allowedProjectScope: (result, done) => {
                expect(result.admin_settings[0].settings).to.deep.equal(globalSettingsData.settings);
                done();
            },
            allowedWrongProjectScope: (result, done) => {
                expect(result.admin_settings[0].settings).to.deep.equal(globalSettingsData.settings);
                done();
            },
            disallowedWrongProjectScope: (result, done) => {
                expect(result.admin_settings[0].settings).to.deep.equal(partialGlobalSettingsData.settings);
                done();
            },
        },
        {
            name: 'nlu_instances',
            collectionName: 'nlu_instances',
            testDataInsert: async () => {
                await Instances.insert(nluInstanceData);
            },
            testDataRemove: async (done) => {
                await Instances.remove({ _id: 'testNluInstance' });
                done();
            },
            args: [projectId],
            acceptedRoles: [...readers.nluData, ...readers.responses, ...readers.projects],
        },
        {
            name: 'nlu_evaluations',
            collectionName: 'nlu_evaluations',
            testDataInsert: async () => {
                await Evaluations.insert(nluEvaluationData);
            },
            testDataRemove: async (done) => {
                await Evaluations.remove({ _id: 'testNluEvaluation' });
                done();
            },
            args: [modelId],
            acceptedRoles: readers.nluData,
        },
        {
            name: 'nlu_models',
            collectionName: 'nlu_models',
            testDataInsert: async () => {
                await NLUModels.insert(nluModelData);
            },
            testDataRemove: async (done) => {
                await NLUModels.remove({ _id: modelId });
                done();
            },
            args: [modelId],
            acceptedRoles: readers.nluData,
        },
        {
            name: 'nlu_models.lite',
            collectionName: 'nlu_models',
            testDataInsert: async () => {
                await NLUModels.insert(nluModelData);
            },
            testDataRemove: async (done) => {
                await NLUModels.remove({ _id: modelId });
                done();
            },
            args: [projectId],
            acceptedRoles: [...readers.nluData, ...readers.responses, ...readers.projects],
        },
        {
            name: 'projects',
            collectionName: 'projects',
            testDataInsert: async () => {},
            testDataRemove: async done => done(),
            args: [projectId],
            acceptedRoles: readers.projects,
            allowed: (result, done) => {
                expect(Object.keys(result.projects[0])).to.include.members(Object.keys(projectData));
                done();
            },
            disallowed: (result, done) => {
                expect(Object.keys(result.projects[0])).to.include.members(Object.keys(partialProjectData))
                    .but.not.include([
                        'namespace',
                        'defaultDomain',
                        'timezoneOffset',
                        'deploymentEnvironments',
                    ]);
                done();
            },
            disallowedWrongProjectScope: (result, done) => {
                expect(result.projects).to.be.equal(undefined);
                done();
            },
        },
        {
            name: 'projects.names',
            collectionName: 'projects',
            testDataInsert: async () => {
                await Projects.insert(projectDneData);
            },
            testDataRemove: async (done) => {
                await Projects.remove({ _id: 'DNE' });
                done();
            },
            args: [projectId],
            acceptedRoles: [...readers.nluData, ...readers.responses, ...readers.projects, 'nlu-data:x'],
            allowedGlobalScope: (result, done) => {
                expect(result.projects).to.have.length(2);
                done();
            },
            allowedProjectScope: (result, done) => {
                expect(result.projects[0]).to.deep.equal({ _id: 'bf', name: 'trial' });
                expect(result.projects).to.have.length(1);
                done();
            },
            allowedWrongProjectScope: (result, done) => {
                expect(result.projects[0]).to.deep.equal({ _id: 'DNE', name: 'wrongProject' });
                expect(result.projects).to.have.length(1);
                done();
            },
        },
        {
            name: 'roles',
            collectionName: 'roles',
            testDataInsert: async () => {},
            testDataRemove: async done => done(),
            args: [],
            acceptedRoles: readers.roles,
            allowed: (result, done) => {
                expect(result.roles.find(({ _id }) => _id === 'nlu-data:r')).to.be.deep.equal({ _id: 'nlu-data:r', children: [] });
                done();
            },
            allowedProjectScope: (result, done) => {
                expect(result.roles.find(({ _id }) => _id === 'nlu-data:r')).to.be.deep.equal({ _id: 'nlu-data:r', children: [] });
                done();
            },
        },
        {
            name: 'slots',
            collectionName: 'slots',
            testDataInsert: async () => {
                await Slots.insert(slotData);
            },
            testDataRemove: async (done) => {
                await Slots.remove({ _id: 'testSlot' });
                done();
            },
            args: [projectId],
            acceptedRoles: readers.stories,
        },
        {
            name: 'stories.selected',
            collectionName: 'stories',
            testDataInsert: async () => {
                await Stories.insert(storyData);
            },
            testDataRemove: async (done) => {
                await Stories.remove({ _id: 'testStory' });
                done();
            },
            args: [projectId, ['testStory']],
            acceptedRoles: readers.stories,
        },
        {
            name: 'stories.light',
            collectionName: 'stories',
            testDataInsert: async () => {
                await Stories.insert(storyData);
            },
            testDataRemove: async (done) => {
                await Stories.remove({ _id: 'testStory' });
                done();
            },
            args: [projectId, 'testStoryGroup'],
            acceptedRoles: readers.stories,
            allowed: (result, done) => {
                expect(['title', 'checkpoints', 'storyGroupId', '_id', 'rules', 'status']).to.include.members(Object.keys(result.stories[0]));
                expect(result.stories).to.have.length(1);
                done();
            },
            disallowed: (result, done) => {
                expect(result.stories[0]).to.be.deep.equal({ _id: 'testStory' });
                expect(result.stories).to.have.length(1);
                done();
            },
        },
        {
            name: 'stories.events',
            collectionName: 'stories',
            testDataInsert: async () => {
                await Stories.insert(storyData);
            },
            testDataRemove: async (done) => {
                await Stories.remove({ _id: 'testStory' });
                done();
            },
            args: [projectId],
            acceptedRoles: readers.responses,
        },
        {
            name: 'storiesGroup',
            collectionName: 'storyGroups',
            testDataInsert: async () => {
                await StoryGroups.insert(storyGroupData);
            },
            testDataRemove: async (done) => {
                await StoryGroups.remove({ _id: 'testStoryGroup' });
                done();
            },
            args: [projectId],
            acceptedRoles: [...readers.stories, 'nlu-data:x'],
        },
        {
            name: 'userData',
            collectionName: 'users',
            testDataInsert: async () => {
                await Meteor.users.insert(globalUserTestData);
                await Meteor.users.insert(projectUserTestData);
                await Meteor.users.insert(otherProjectUserTestData);
                await setScopes(formatRoles('responses:r', 'GLOBAL'), 'userDataTestA');
                await setScopes(formatRoles('responses:r', 'bf'), 'userDataTestB');
                await setScopes({ roles: [{ roles: 'responses:r', project: 'bf' }, { roles: 'responses:r', project: 'other' }] }, 'userDataTestC');
            },
            testDataRemove: async (done) => {
                await Meteor.users.remove({ _id: 'userDataTestA' });
                await Meteor.roleAssignment.remove({ user: { _id: 'userDataTestA' } });
                await Meteor.users.remove({ _id: 'userDataTestB' });
                await Meteor.roleAssignment.remove({ user: { _id: 'userDataTestB' } });
                await Meteor.users.remove({ _id: 'userDataTestC' });
                await Meteor.roleAssignment.remove({ user: { _id: 'userDataTestC' } });
                done();
            },
            allowedGlobalScope: (result, done) => {
                expect(result.users.length).to.be.equal(4);
                done();
            },
            allowedProjectScope: (result, done) => {
                expect(result.users.length).to.be.equal(2);
                done();
            },
            allowedWrongProjectScope: (result, done) => {
                expect(result.users.length).to.be.equal(1);
                done();
            },
            args: [],
            acceptedRoles: readers.users,
        },
     
        {
            name: 'deploymentWebhook',
            collectionName: 'admin_settings',
            args: [projectId],
            acceptedRoles: writers.projects,
            testDataInsert: async () => {
                await GlobalSettings.insert(globalSettingsData);
            },
            testDataRemove: async (done) => {
                await GlobalSettings.remove({ _id: 'SETTINGS' });
                done();
            },
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
    
    // const testSubscription = async (subscription, role, scope, args, callback, done) => {
    const testSubscription = async (testParams, role, scope, done, callback) => {
        const {
            testDataInsert,
            name,
            args,
        } = testParams;
        try {
            await deleteTestUser();
            await deleteProject();
            await createTestUser();
            await createProject();
            await testDataInsert();
            await setUserScopes(role, scope);
            const collector = new PublicationCollector({ userId });
            await collector.collect(name, ...args, callback);
        } catch (e) {
            if (e.error !== '403') console.log(e);
            expect(e.error).to.be.equal('403');
            done();
        }
    };
    // ----tests-----
    describe('test permission checks on meteor subscriptions', () => {
        subscriptions.forEach((testParams) => {
            roles.forEach((role) => {
                afterEach((done) => {
                    testParams.testDataRemove(done);
                });
                it(`subscribe to ${testParams.name} as ${role} with GLOBAL scope`, (done) => {
                    testSubscription(testParams, role, 'GLOBAL', done, (collections) => {
                        if (testParams.acceptedRoles.includes(role)) {
                            if (testParams.allowedGlobalScope) {
                                testParams.allowedGlobalScope(collections, done);
                                return;
                            }
                            if (testParams.allowed) {
                                testParams.allowed(collections, done);
                                return;
                            }
                            expect((collections[testParams.collectionName] || {}).length).to.be.equal(1);
                            done();
                            return;
                        }
                        if (testParams.disallowedGlobalScope) {
                            testParams.disallowedGlobalScope(collections, done);
                            return;
                        }
                        if (testParams.disallowed) {
                            testParams.disallowed(collections, done);
                            return;
                        }
                        expect((collections[testParams.collectionName] || {}).length).to.not.be.equal(1);
                        done();
                    });
                });
                it(`should subscribe to ${testParams.name} as ${role} with project scope`, (done) => {
                    testSubscription(testParams, role, projectId, done, (collections) => {
                        if (testParams.acceptedRoles.includes(role) && !testParams.rejectProjectScope) {
                            if (testParams.allowedProjectScope) {
                                testParams.allowedProjectScope(collections, done);
                                return;
                            }
                            if (testParams.allowed) {
                                testParams.allowed(collections, done, 'GLOBAL');
                                return;
                            }
                            expect((collections[testParams.collectionName] || {}).length).to.be.equal(1);
                            done();
                            return;
                        }
                        if (testParams.disallowedProjectScope) {
                            testParams.disallowedProjectScope(collections, done);
                            return;
                        }
                        if (testParams.disallowed) {
                            testParams.disallowed(collections, done, 'bf');
                            return;
                        }
                        expect((collections[testParams.collectionName] || {}).length).to.not.be.equal(1);
                        done();
                    });
                });
                it(`should subscribe to ${testParams.name} as ${role} with wrong project scope`, (done) => {
                    testSubscription(testParams, role, 'DNE', done, ((collections) => {
                        if (testParams.allowedWrongProjectScope && testParams.acceptedRoles.includes(role)) {
                            testParams.allowedWrongProjectScope(collections, done);
                            return;
                        }
                        if (testParams.disallowedWrongProjectScope) {
                            testParams.disallowedWrongProjectScope(collections, done);
                            return;
                        }
                        expect((collections[testParams.collectionName] || {}).length).to.not.be.equal(1);
                        done();
                    }));
                });
            });
        });
    });

    const createSecondUser = async () => {
        await Meteor.users.remove({ _id: 'seconduserid' });
        await Meteor.users.insert({
            _id: 'seconduserid',
            createdAt: '2020-02-25T20:11:13.025Z',
            services: {},
            emails: [{ address: 'test2@test.com', verified: true }],
            profile: { firstName: 'test', lastName: 'test' },
            roles: [],
        });
    };

    const allowedRoles = [
        'users:w',
        'users:r',
        'roles:r',
        'roles:w',
        'global-admin',
    ];
    
    const testRolesAutoSubscription = async (scope, role, done) => {
        await deleteTestUser();
        await deleteProject();
        await createTestUser();
        await createSecondUser();
        await createProject();
        await setUserScopes(role, scope);
        await setScopes(formatRoles(role, scope), 'seconduserid');
        const result = publishRoles({ userId: 'testuserid', ready: () => {} }).fetch();
        if (allowedRoles.includes(role)) expect(result).to.have.length(2);
        else expect(result).to.have.length(1);
        done();
    };


    describe('test roles autoSubscription', () => {
        roles.forEach((role) => {
            it(`subscribing to roles autosubscription as ${role}`, (done) => {
                testRolesAutoSubscription('GLOBAL', role, done);
            });
        });
    });
}
