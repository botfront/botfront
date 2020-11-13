import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { safeLoad } from 'js-yaml';

import Conversations from '../conversations/conversations.model.js';
import Activity from '../activity/activity.model';
import { Credentials } from '../../credentials';
import { Endpoints } from '../../endpoints/endpoints.collection';
import { Instances } from '../../instances/instances.collection';
import { GlobalSettings } from '../../globalSettings/globalSettings.collection';
import { Slots } from '../../slots/slots.collection';
import BotResponses from '../botResponses/botResponses.model';

import '../../project/project.methods';
import '../../nlu_model/nlu_model.methods';
import '../../slots/slots.methods';
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
    validDomain,
    validDomainParsed,
    validDomainFr,
    validDomainFrParsed,
    validDomainsMerged,
} from '../../../lib/importers/test_data/domain.data.js';

const params = { projectId: 'bf' };

const removeDates = arr => arr.map((obj) => {
    const { createdAt, updatedAt, ...newObj } = obj;
    return newObj;
});

const removeId = (obj) => {
    const { _id, id, ...newObj } = obj;
    return newObj;
};

if (Meteor.isServer) {
    describe('file importers', () => {
        it('should import conversations', async () => {
            const importResult = await handleImportConversations(
                [{ ...validConversations, conversations: validConversationsParsed }],
                params,
            );
            const conversations = await Conversations.find({ projectId: 'bf' }).lean();
            await expect(importResult).to.eql([]);
            await expect(conversations).to.eql(validConversationsParsed);
        });
        it('should import Incoming', async () => {
            const importResult = await handleImportIncoming(
                [{ ...validIncoming, incoming: validIncomingParsed }],
                params,
            );
            const incoming = await Activity.find({ projectId: 'bf' }).lean();
            const incomingNoDates = removeDates(incoming);
            const validIncomingNoDates = removeDates(validIncomingParsed);
            await expect(importResult).to.eql([]);
            await expect(incomingNoDates).to.eql(validIncomingNoDates);
        });
        it('should import Credentials', async () => {
            const importResult = await handleImportCredentials(
                [{ ...validCredentials, credentials: validCredentialsParsed }],
                params,
            );
            const credentials = await Credentials.findOne({ projectId: 'bf' });
            await expect(importResult).to.eql([]);
            await expect(credentials.credentials).to.eql(validCredentials.rawText);
        });

        it('should import Endpoints', async () => {
            const importResult = await handleImportEndpoints(
                [{ ...validEndpoints, endpoints: validEndpointsParsed }],
                params,
            );
            const endpoints = await Endpoints.findOne({ projectId: 'bf' });
            await expect(importResult).to.eql([]);
            await expect(endpoints.endpoints).to.eql(validEndpoints.rawText);
        });
        it('should import bfConfig', async () => {
            await Projects.remove({});
            await Instances.remove({});
            await Projects.insert({
                _id: 'bf',
                name: 'test',
                languages: ['fr'],
                defaultLanguage: 'fr',
            });
            await Instances.insert({
                host: 'http://aa',
                projectId: 'bf',
            });
            const importResult = await handleImportBfConfig(
                [{ ...validBfConfig, bfconfig: validBfConfigParsed }],
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
                    ...config,
                },
            ])[0];
            await expect(importResult).to.eql([]);
            await expect(removeId(instanceDb)).to.eql(removeId(instance));
            await expect(project).to.eql(compProject);
        });
        it('should import defaultDomain', async () => {
            await Projects.remove({});
            await Projects.insert({
                _id: 'bf',
                name: 'test',
                languages: ['fr'],
                defaultLanguage: 'fr',
            });
            const importResult = await handleImportDefaultDomain(
                [{ ...validDefaultDomain }],
                { ...params, defaultDomain: validDefaultDomainParsed },
            );
            const project = removeDates([Projects.findOne({ _id: 'bf' })])[0];
            const compProject = removeDates([
                {
                    _id: 'bf',
                    disabled: false,
                    enableSharing: false,
                    defaultDomain: {
                        content:
                            // eslint-disable-next-line max-len
                            'slots:\n  disambiguation_message:\n    type: unfeaturized\nresponses:\n  utter_goodbye:\n    - language: en\n      text: \'Goodbye :(\'\n  utter_greet:\n    - language: en\n      text: Hey there!\nforms:\n  restaurant_form:\n    cuisine:\n      - entity: cuisine\n        type: from_entity\nactions:\n  - action_aaa',
                    },
                    name: 'test',
                    languages: ['fr'],
                    defaultLanguage: 'fr',
                    storyGroups: [],
                },
            ])[0];
            await expect(importResult).to.eql([]);
            await expect(project).to.eql(compProject);
        });
        it('should import rasaConfig', async () => {
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
            await expect(safeLoad(policiesDb.policies)).to.eql(
                validRasaConfigPoliciesParsed.policies,
            );
            await expect(safeLoad(modelfr.config)).to.eql(
                validRasaConfigFrParsed.pipeline,
            );
            await expect(safeLoad(modelen.config)).to.eql(
                validRasaConfigPipelineParsed.pipeline,
            );
            await expect(modelru.config).to.eql('test');
        });
        it('should import domain', async () => {
            await Projects.insert({
                _id: 'bf',
                name: 'test',
                languages: ['en'],
                defaultLanguage: 'en',
                defaultDomain: { content: '{}' },
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
                    },
                ],
                params,
            );
            const reponses = await BotResponses.find({ projectId: 'bf' }).lean();
            const slots = await Slots.find({ projectId: 'bf' }).fetch();
            const project = Projects.findOne({ _id: 'bf' });
            await expect(importResult).to.eql([]);
            await expect(reponses.map(removeId)).to.eql(validDomainsMerged.responses);
            await expect(slots.map(removeId)).to.eql(validDomainsMerged.slots);
            await expect(project.defaultDomain.content).to.eql(`forms:
  restaurant_form:
    cuisine:
      - entity: cuisine
        type: from_entity`);
        });
    });
}
