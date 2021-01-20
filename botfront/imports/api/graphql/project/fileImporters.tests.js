import { Meteor } from 'meteor/meteor';
import { safeLoad } from 'js-yaml';
import chai from 'chai';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import Conversations from '../conversations/conversations.model.js';
import Activity from '../activity/activity.model';
import AnalyticsDashboards from '../analyticsDashboards/analyticsDashboards.model';
import { Credentials } from '../../credentials';
import { Endpoints } from '../../endpoints/endpoints.collection';
import { Instances } from '../../instances/instances.collection';
import { GlobalSettings } from '../../globalSettings/globalSettings.collection';
import { Slots } from '../../slots/slots.collection';
import BotResponses from '../botResponses/botResponses.model';
import FormResults from '../forms/form_results.model';

import { CorePolicies } from '../../core_policies';
import { Projects } from '../../project/project.collection';
import { NLUModels } from '../../nlu_model/nlu_model.collection';
import {
    handleImportBfConfig,
    handleImportConversations,
    handleImportIncoming,
    handleImportDefaultDomain,
    handleImportDomain,
    handleImportCredentials,
    handleImportEndpoints,
    handleImportRasaConfig,
    handleImportAnalyticsConfig,
    handleImportWidgetSettings,
    handleImportFromResults,
} from './fileImporters';
import {
    validConversationsParsed,
    validConversations,
} from '../../../lib/importers/test_data/conversation.data';
import {
    validIncomingParsed,
    validIncoming,
} from '../../../lib/importers/test_data/incoming.data';

import {
    validCredentials,
    validCredentialsParsed,
} from '../../../lib/importers/test_data/credentials.data.js';
import {
    validEndpoints,
    validEndpointsParsed,
} from '../../../lib/importers/test_data/endpoints.data.js';
import {
    validBfConfig,
    validBfConfigParsed,
} from '../../../lib/importers/test_data/bfConfig.data.js';
import {
    validRasaConfigFr,
    validRasaConfigFrParsed,
    validRasaConfigPipeline,
    validRasaConfigPolicies,
    validRasaConfigPipelineParsed,
    validRasaConfigPoliciesParsed,
} from '../../../lib/importers/test_data/rasaconfig.data.js';
import {
    validDefaultDomain,
    validDefaultDomainParsed,
} from '../../../lib/importers/test_data/defaultdomain.data.js';
import {
    validAnalytics,
    validAnalyticsParsed,
} from '../../../lib/importers/test_data/analytics.data.js';

import {
    validDomain,
    validDomainParsed,
    validDomainFr,
    validDomainFrParsed,
    validDomainsMerged,
} from '../../../lib/importers/test_data/domain.data.js';
import { createTestUser, removeTestUser } from '../../testUtils';
import { validWidgetSettings, validWidgetSettingsParsed } from '../../../lib/importers/test_data/widgetsettings.data.js';
import { validFormResults, validFormResultsParsed } from '../../../lib/importers/test_data/formresults.data.js';


chai.use(deepEqualInAnyOrder);

const { expect } = chai;

const params = { projectId: 'bf', supportedEnvs: ['development'] };

const removeDates = arr => arr.map((obj) => {
    const {
        createdAt, updatedAt, date, ...newObj
    } = obj;
    return newObj;
});

const removeId = (obj) => {
    const { _id, id, ...newObj } = obj;
    return newObj;
};

const removeIds = arr => arr.map(removeId);

const caught = func => async (done) => {
    try {
        await func();
        done();
    } catch (e) {
        done(e);
    }
};

if (Meteor.isServer) {
    // we only import those here otherwise they  will be loaded when doing client test and make the client side test fail
    import '../../project/project.methods';
    import '../../nlu_model/nlu_model.methods';
    import '../../slots/slots.methods';

    describe('file importers', () => {
        before(caught(async () => {
            await removeTestUser();
            await createTestUser();
        }));
        after(caught(removeTestUser));
        it('should import conversations and wipe the previous ones in existing env', async () => {
            await Conversations.deleteMany({});
            await Conversations.create([{ _id: 'test', test: 'test', projectId: 'bf' }]);
            const importResult = await handleImportConversations(
                [{ ...validConversations, conversations: validConversationsParsed, env: 'development' }],
                { ...params, wipeInvolvedCollections: true },
            );
            const conversations = await Conversations.find({ projectId: 'bf' }).lean();
            await expect(importResult).to.eql([]);
            // we use equalInAnyOrder because the conversation are send to the db in parrallel, so we don't know the order
            await expect(removeIds(conversations)).to.deep.equalInAnyOrder(removeIds(validConversationsParsed));
        });
        it('should import conversations in  existing env', async () => {
            await Conversations.deleteMany({});
            const importResult = await handleImportConversations(
                [{ ...validConversations, conversations: validConversationsParsed, env: 'production' }],
                { ...params, supportedEnvs: ['development', 'production'] },
            );
            const conversations = await Conversations.find({ projectId: 'bf' }).lean();
            await expect(importResult).to.eql([]);
            // we use equalInAnyOrder because the conversation are send to the db in parrallel, so we don't know the order
            await expect(removeIds(conversations)).to.deep.equalInAnyOrder(removeIds(validConversationsParsed.map(conv => ({ ...conv, env: 'production' }))));
        });
        it('should not import conversations if env is not supported', async () => {
            await Conversations.deleteMany({});
            const importResult = await handleImportConversations(
                [{ ...validConversations, conversations: validConversationsParsed, env: 'production' }],
                params,
            );
            const conversations = await Conversations.find({ projectId: 'bf' }).lean();
            await expect(importResult).to.eql([]);
            await expect(conversations).to.eql([]);
        });
        it('should import Incoming and wipe the previous ones in existing env', async () => {
            await Activity.deleteMany({});
            await Activity.create([{ _id: 'test', test: 'test', projectId: 'bf' }]);
            const importResult = await handleImportIncoming(
                [{ ...validIncoming, incoming: validIncomingParsed, env: 'development' }],
                { ...params, wipeInvolvedCollections: true },
            );
            const incoming = await Activity.find({ projectId: 'bf' }).lean();
            const incomingNoDates = removeDates(incoming);
            const validIncomingNoDates = removeDates(validIncomingParsed);
            await expect(importResult).to.eql([]);
            // we use equalInAnyOrder because the incoming are send to the db in parrallel, so we don't know the order
            await expect(incomingNoDates).to.deep.equalInAnyOrder(validIncomingNoDates);
        });
        it('should import Incoming  in  existing env', async () => {
            await Activity.deleteMany({});
            const importResult = await handleImportIncoming(
                [{ ...validIncoming, incoming: validIncomingParsed, env: 'production' }],
                { ...params, supportedEnvs: ['development', 'production'] },
            );
            const incoming = await Activity.find({ projectId: 'bf' }).lean();
            const incomingNoDates = removeDates(incoming);
            const validIncomingNoDates = removeDates(validIncomingParsed);
            await expect(importResult).to.eql([]);
            // we use equalInAnyOrder because the incoming are send to the db in parrallel, so we don't know the order
            await expect(incomingNoDates).to.deep.equalInAnyOrder(validIncomingNoDates.map(inc => ({ ...inc, env: 'production' })));
        });
        it('should not import Incoming if env is not supported', async () => {
            await Activity.deleteMany({});
            const importResult = await handleImportIncoming(
                [{ ...validIncoming, incoming: validIncomingParsed, env: 'production' }],
                params,
            );
            const incoming = await Activity.find({ projectId: 'bf' }).lean();
      
            await expect(importResult).to.eql([]);
            // we use equalInAnyOrder because the incoming are send to the db in parrallel, so we don't know the order
            await expect(incoming).to.deep.equalInAnyOrder([]);
        });
        it('should import Credentials in  existing env', async () => {
            await Credentials.remove({});
            const importResult = await handleImportCredentials(
                [{ ...validCredentials, credentials: validCredentialsParsed, env: 'production' }],
                { ...params, supportedEnvs: ['development', 'production'] },
            );
            const credentials = await Credentials.findOne({ projectId: 'bf', environment: 'production' });
            await expect(importResult).to.eql([]);
            await expect(credentials.credentials).to.eql(validCredentials.rawText);
        });
        it('should  not import Credentials if env is not supported', async () => {
            await Credentials.remove({});
            const importResult = await handleImportCredentials(
                [{ ...validCredentials, credentials: validCredentialsParsed, env: 'production' }],
                params,
            );
            const credentials = await Credentials.findOne({ projectId: 'bf' });
            await expect(importResult).to.eql([]);
            await expect(credentials?.credentials).to.eql(undefined);
        });
        it('should import Endpoints  in  existing env', async () => {
            await Endpoints.remove({});
            const importResult = await handleImportEndpoints(
                [{ ...validEndpoints, endpoints: validEndpointsParsed, env: 'production' }],
                { ...params, supportedEnvs: ['development', 'production'] },
            );
            const endpoints = await Endpoints.findOne({ projectId: 'bf', environment: 'production' });
            await expect(importResult).to.eql([]);
            await expect(endpoints?.endpoints).to.eql(validEndpoints.rawText);
        });
        it('should not import Endpoints if env is not supported', async () => {
            await Endpoints.remove({});
            const importResult = await handleImportEndpoints(
                [{ ...validEndpoints, endpoints: validEndpointsParsed, env: 'production' }],
                params,
            );
            const endpoints = await Endpoints.findOne({ projectId: 'bf' });
            await expect(importResult).to.eql([]);
            await expect(endpoints?.endpoints).to.eql(undefined);
        });
        it('should import bfConfig', async () => {
            await Projects.remove({});
            await Instances.remove({});
            await Projects.insert({
                _id: 'bf',
                name: 'test',
                languages: ['fr'],
                defaultLanguage: 'fr',
                namespace: 'bf-ha',
            });
            await Instances.insert({
                host: 'http://aa',
                projectId: 'bf',
            });
            const importResult = await handleImportBfConfig(
                [{ ...validBfConfig, bfconfig: validBfConfigParsed, env: 'development' }],
                params,
            );
            const project = removeDates([Projects.findOne({ _id: 'bf' })])[0];
            const instanceDb = await Instances.findOne({ projectId: 'bf' });
            const { instance, ...config } = validBfConfigParsed;
            const compProject = removeDates([
                {
                    _id: 'bf',
                    disabled: false,
                    enableSharing: false,
                    storyGroups: [],
                    ...config,
                    languages: ['fr'],
                },
            ])[0];
            await expect(importResult).to.eql([]);
            await expect(removeId(instanceDb)).to.eql(removeId(instance));
            await expect(project).excludingEvery([
                'allowContextualQuestions',
                'namespace',
                'nluThreshold',
                'timezoneOffset',
                'deploymentEnvironments',
            ]).to.eql(compProject);
        });
        it('should import defaultDomain', async () => {
            await Projects.remove({});
            await Projects.insert({
                _id: 'bf',
                name: 'test',
                languages: ['fr'],
                defaultLanguage: 'fr',
                namespace: 'bf-ha',
            });
            const importResult = await handleImportDefaultDomain(
                [{ ...validDefaultDomain }],
                { ...params, defaultDomain: validDefaultDomainParsed },
            );
            const { defaultDomain } = Projects.findOne({ _id: 'bf' });
            const compdefaultDomain = {
                content:
                            // eslint-disable-next-line max-len
                            'slots:\n  test_message:\n    type: unfeaturized\nresponses:\n  utter_goodbye:\n    - language: en\n      text: \'Goodbye :(\'\n  utter_greet:\n    - language: en\n      text: Hey there!\n  utter_double:\n    - language: en\n      text: Hey there!1\nforms:\n  restaurant_form:\n    cuisine:\n      - entity: cuisine\n        type: from_entity\nactions:\n  - action_aaa',
            };
            await expect(importResult).to.eql([]);
            await expect(defaultDomain).to.eql(compdefaultDomain);
        });
        it('should import rasaConfig', async () => {
            await Projects.remove({});
            const settings = {
                public: {
                    defaultNLUConfig: 'test',
                },
            };
            await NLUModels.insert({ projectId: 'bf', language: 'en' });
            GlobalSettings.insert({ _id: 'SETTINGS', settings });
            const toImport = [
                {
                    ...validRasaConfigPolicies,
                    ...validRasaConfigPoliciesParsed,
                },
                {
                    ...validRasaConfigFr,
                    ...validRasaConfigFrParsed,
                },
                {
                    ...validRasaConfigPipeline,
                    ...validRasaConfigPipelineParsed,
                },
            ];
            await Projects.insert({
                _id: 'bf',
                name: 'test',
                languages: ['en'],
                defaultLanguage: 'en',
                namespace: 'bf-ha',
            });
            const importResult = await handleImportRasaConfig(toImport, {
                ...params,
                projectLanguages: ['en', 'fr', 'ru'],
            });
            const policiesDb = await CorePolicies.findOne({ projectId: 'bf' });
            const modelfr = await NLUModels.findOne({ projectId: 'bf', language: 'fr' });
            const modelen = await NLUModels.findOne({ projectId: 'bf', language: 'en' });
            const modelru = await NLUModels.findOne({ projectId: 'bf', language: 'ru' });
            await expect(importResult).to.eql([]);
            await expect(safeLoad(policiesDb.policies).policies).to.eql(
                validRasaConfigPoliciesParsed.policies,
            );
            await expect(safeLoad(modelfr.config).pipeline).to.eql(
                validRasaConfigFrParsed.pipeline,
            );
            await expect(safeLoad(modelen.config).pipeline).to.eql(
                validRasaConfigPipelineParsed.pipeline,
            );
            await expect(modelru.config).to.eql('test');
        });
        it('should import domain', async () => {
            await Projects.remove({});
            await BotResponses.deleteMany({});
            await Projects.insert({
                _id: 'bf',
                name: 'test',
                languages: ['en'],
                defaultLanguage: 'en',
                defaultDomain: {
                    content: `forms:
  restaurant_form:
    cuisineold:
      - entity: cuisine
        type: from_entity`,
                },
                namespace: 'bf-ha',
            });
            await BotResponses.create({
                projectId: 'bf',
                textIndex: 'utter_greet\nSalut!\nHey there!',
                key: 'utter_greet',
                values: [
                    {
                        lang: 'ru',
                        sequence: [
                            {
                                content: 'text: Здравствуйте\n',
                            },
                        ],
                    },
                ],
            });
            const importResult = await handleImportDomain(
                [
                    {
                        ...validDomainFr,
                        ...validDomainFrParsed,
                    },
                    {
                        ...validDomain,
                        ...validDomainParsed,
                        actions: [...validDomainParsed.actions, 'action_get_help'],
                    },
                ],
                params,
            );
            const reponses = await BotResponses.find({ projectId: 'bf' }).lean();
            const slots = await Slots.find({ projectId: 'bf' }).fetch();
            const project = Projects.findOne({ _id: 'bf' });
            await expect(importResult).to.eql([]);
            await expect(reponses.map(removeId)).to.eql(validDomainsMerged.responses);
            await expect(slots.map(removeId)).to.deep.equalInAnyOrder(validDomainsMerged.slots);
            await expect(project.defaultDomain.content).to.eql(`forms:
  restaurant_form:
    cuisine:
      - entity: cuisine
        type: from_entity
actions:
  - action_aaa
  - action_get_help`);
        });
        it('should import domain wipe and not have duplicates', async () => {
            await Projects.remove({});
            await BotResponses.deleteMany({});
            await Slots.remove({});

            await Projects.insert({
                _id: 'bf',
                name: 'test',
                languages: ['en'],
                defaultLanguage: 'en',
                defaultDomain: {
                    content: `forms:
  restaurant_form:
    cuisineold:
      - entity: cuisine
        type: from_entity`,
                },
                namespace: 'bf-ha',
            });
            await BotResponses.create({
                projectId: 'bf',
                textIndex: 'utter_greet\nSalut!\nHey there!',
                key: 'utter_greet',
                values: [
                    {
                        lang: 'ru',
                        sequence: [
                            {
                                content: 'text: Здравствуйте\n',
                            },
                        ],
                    },
                ],
            });
            const import1Result = await handleImportDomain(
                [
                    {
                        ...validDomainFr,
                        ...validDomainFrParsed,
                    },
                    {
                        ...validDomain,
                        ...validDomainParsed,
                        actions: [...validDomainParsed.actions, 'action_get_help'],
                    },
                ],
                params,
            );
            await expect(import1Result).to.eql([]);
            const import2Result = await handleImportDomain(
                [
                    {
                        ...validDomainFr,
                        ...validDomainFrParsed,
                    },
                    {
                        ...validDomain,
                        ...validDomainParsed,
                        actions: [...validDomainParsed.actions, 'action_get_help'],
                    },
                ],
                { ...params, wipeInvolvedCollections: true },
            );
            await expect(import2Result).to.eql([]);
            const reponses = await BotResponses.find({ projectId: 'bf' }).lean();
            const slots = await Slots.find({ projectId: 'bf' }).fetch();
            const project = Projects.findOne({ _id: 'bf' });
            await expect(reponses.map(removeId)).to.equalInAnyOrder(validDomainsMerged.responses);
            await expect(slots.map(removeId)).to.deep.equalInAnyOrder(validDomainsMerged.slots);
            await expect(project.defaultDomain.content).to.eql(`forms:
  restaurant_form:
    cuisine:
      - entity: cuisine
        type: from_entity
actions:
  - action_aaa
  - action_get_help`);
        });
        it('should import analytics config', async () => {
            await AnalyticsDashboards.deleteOne({ projectId: 'bf' });
            const importResult = await handleImportAnalyticsConfig(
                [{ ...validAnalytics, analytics: validAnalyticsParsed }],
                params,
            );
            const dashboard = await AnalyticsDashboards.findOne({ projectId: 'bf' }).lean();
            await expect(importResult).to.eql([]);
            await expect(removeId(dashboard)).to.eql(removeId({ ...validAnalyticsParsed, projectId: 'bf' }));
        });
        
        it('should import widget settings', async () => {
            await Projects.remove({});
            await Projects.insert({
                _id: 'bf',
                name: 'test',
                languages: ['fr'],
                defaultLanguage: 'fr',
                namespace: 'bf-ha',
            });
            const importResult = await handleImportWidgetSettings(
                [{ ...validWidgetSettings, widgetsettings: validWidgetSettingsParsed }], params,
            );

            const project = removeDates([await Projects.findOne({ _id: 'bf' })])[0];
       
            await expect(importResult).to.eql([]);
            await expect(project.chatWidgetSettings).to.eql(validWidgetSettingsParsed);
        });
        it('should import form results and wipe the previous ones in existing env', async () => {
            await FormResults.deleteMany({});
            await FormResults.create([{ _id: 'test', test: 'test', projectId: 'bf' }]);
            const importResult = await handleImportFromResults(
                [{ ...validFormResults, formresults: validFormResultsParsed, env: 'development' }],
                { ...params, wipeInvolvedCollections: true },
            );
            const formresults = await FormResults.find({ projectId: 'bf' }).lean();
            await expect(importResult).to.eql([]);
            // we use equalInAnyOrder because the conversation are send to the db in parrallel, so we don't know the order
            await expect(removeDates(formresults)).to.deep.equalInAnyOrder(removeDates(validFormResultsParsed));
        });
        it('should import form results in  existing env', async () => {
            await FormResults.deleteMany({});
            const importResult = await handleImportFromResults(
                [{ ...validFormResults, formresults: validFormResultsParsed, env: 'production' }],
                { ...params, supportedEnvs: ['development', 'production'] },
            );
            const formresults = await FormResults.find({ projectId: 'bf' }).lean();
            await expect(importResult).to.eql([]);
            // we use equalInAnyOrder because the conversation are send to the db in parrallel, so we don't know the order
            await expect(removeDates(formresults)).to.deep.equalInAnyOrder(removeDates(validFormResultsParsed.map(conv => ({ ...conv, environment: 'production' }))));
        });
        it('should not import form results if env is not supported', async () => {
            await FormResults.deleteMany({});
            const importResult = await handleImportFromResults(
                [{ ...validFormResults, formresults: validFormResultsParsed, env: 'production' }],
                params,
            );
            const formresults = await FormResults.find({ projectId: 'bf' }).lean();
            await expect(importResult).to.eql([]);
            await expect(formresults).to.eql([]);
        });
    });
}
