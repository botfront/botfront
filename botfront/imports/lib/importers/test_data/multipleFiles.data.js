
import { validCredentials, validCredentialsParsed } from './credentials.data.js';
import { validEndpoints, validEndpointsParsed } from './endpoints.data.js';
import { validBfConfig, validBfConfigParsed } from './bfConfig.data.js';
import {
    validRasaConfig, validRasaConfigParsed,
    validRasaConfigPipeline, validRasaConfigPolicies,
    validRasaConfigPipelineParsed, validRasaConfigPoliciesParsed,
    badRasaConfig,
} from './rasaconfig.data.js';
import {
    validDefaultDomain, validDefaultDomain2, mergedDefaultDomains, validDefaultDomainParsed, validDefaultDomainParsed2, invalidDefaultDomain,
} from './defaultdomain.data.js';
import { validDomain, validDomainParsed } from './domain.data.js';
import { validConversations, validConversationsParsed } from './conversation.data.js';
import { storyWithAction, storyWithActionParsed } from './training_data.data';

import { validIncoming, validIncomingParsed } from './incoming.data.js';

const projectId = 'bf';
const defaultDomain = {
    actions: [
        'action_defaultdbdomain',
    ],
    slots: [
        {
            name: 'disambiguation_message',
            type: 'unfeaturized',
        },
    ],
};

const params = {
    projectId,
    projectLanguages: [
        'en',
    ],
    fallbackLang: 'en',
    supportedEnvs: ['development'],
};

const expectedParams = {
    projectId,
    defaultDomain,
    instanceHost: 'http://localhost:1234',
    projectLanguages: [
        'en',
    ],
    fallbackLang: 'en',
    supportedEnvs: ['development'],
    existingStoryGroups: [],
    wipeInvolvedCollections: undefined,
    wipeFragments: undefined,
    wipeNluData: [],
    actionsFromFragments: [],
    storyGroupsUsed: [],
};


export const multipleFiles = [
    {
        name: 'should mark a second credentials with an error',
        files: [validCredentials, validCredentials],
        params,
        expectedFiles: [{
            ...validCredentials,
            env: 'development',
            credentials: validCredentialsParsed,
            warnings: [],
        },
        {
            ...validCredentials,
            env: 'development',
            credentials: validCredentialsParsed,
            warnings: [
                'Conflicts with credentialstest.yml, and thus won\'t be used in the import',
            ],
        }],
        expectedParams: {
            ...expectedParams,
            summary: ['Credentials will be imported from credentialstest.yml.'],
        },
    },
    {
        name: 'should mark a second endpoints file with an error',
        files: [validEndpoints, validEndpoints],
        params,
        expectedFiles: [{
            ...validEndpoints,
            env: 'development',
            endpoints: validEndpointsParsed,
            warnings: [],
        },
        {
            ...validEndpoints,
            env: 'development',
            endpoints: validEndpointsParsed,
            warnings: [
                'Conflicts with endpointstest.yml, and thus won\'t be used in the import',
            ],
        }],
        expectedParams: {
            ...expectedParams,
            summary: ['Endpoints will be imported from endpointstest.yml.'],
        },
    },
    {
        name: 'should mark a second bfconfig file with an error',
        files: [validBfConfig, validBfConfig],
        params,
        expectedFiles: [{
            ...validBfConfig,
            env: 'development',
            bfconfig: validBfConfigParsed,
            warnings: [],
        },
        {
            ...validBfConfig,
            env: 'development',
            bfconfig: validBfConfigParsed,
            warnings: [
                'Conflicts with bfconfigtest.yml, and thus won\'t be used in the import',
            ],
        }],
        expectedParams: {
            ...expectedParams,
            instanceHost: 'http://localhost:6005',
            summary: ['Botfront config will be imported from bfconfigtest.yml.'],
        },
    },
    {
        name: 'should merge the number of conversations in the files',
        files: [validConversations, validConversations],
        params,
        expectedFiles: [{
            ...validConversations,
            conversations: validConversationsParsed,
            env: 'development',
            warnings: [],
        },
        {
            ...validConversations,
            conversations: validConversationsParsed,
            env: 'development',
            warnings: [],
        }],
        expectedParams: {
            ...expectedParams,
           
            summary: ['You will add 4 conversations'],
        },
    },
    {
        name: 'should merge the number of incomming in the files',
        files: [validIncoming, validIncoming],
        params,
        expectedFiles: [{
            ...validIncoming,
            env: 'development',
            incoming: validIncomingParsed,
            warnings: [],
        }, {
            ...validIncoming,
            env: 'development',
            incoming: validIncomingParsed,
            warnings: [],
        }],
        expectedParams: {
            ...expectedParams,
            summary: ['You will add 4 incoming'],
        },
    },
    {
        name: 'should merge default domains excluding those with errors',
        files: [invalidDefaultDomain, validDefaultDomain, validDefaultDomain2, invalidDefaultDomain],
        params,
        expectedFiles: [
            {
                ...invalidDefaultDomain,
                errors: ['Not valid yaml: end of the stream or a document separator is expected at line 3, column 1:\n    a_message:\n    ^'],
            }, {
                ...validDefaultDomain,
                ...validDefaultDomainParsed,
                bfForms: [],
                warnings: [],
                newLanguages: [],
            }, {
                ...validDefaultDomain2,
                ...validDefaultDomainParsed2,
                bfForms: [],
                newLanguages: ['fr'],
                warnings: [{
                    text: 'those reponses will add the support for the language fr :',
                    longText: 'utter_greet',
                }, 'You have multiple domain files. In case of a conflict, data from first file will prevail.'],
            },
            {
                ...invalidDefaultDomain,
                errors: ['Not valid yaml: end of the stream or a document separator is expected at line 3, column 1:\n    a_message:\n    ^'],
            }],
        expectedParams: {
            ...expectedParams,
            summary: ['The default domain will be replaced by default-domain1.yml, default-domain2.yml.'],
            defaultDomain: mergedDefaultDomains,
        },
    },
    {
        name: 'should remove data of domain that already exists in the default domain',
        files: [validDomain, validDefaultDomain],
        params,
        expectedFiles: [{
            ...validDomain,
            ...validDomainParsed,
            slots:
            [
                {
                    initialValue: 'fr',
                    name: 'a_language',
                    type: 'unfeaturized',
                },
            ],
            responses: [{
                key: 'utter_aaa',
                values: [
                    {
                        lang: 'en',
                        sequence: [
                            {
                                content: 'text: aaaa\n',
                            },
                        ],
                    },
                ],
            }],
            bfForms: [],
            warnings: [
                {
                    longText: 'They will be added to the project\'s default domain.',
                    text: 'Some actions in domain are not explicitly mentioned in dialogue fragments.',
                },
                
            ],
            newLanguages: [],
        },
        {
            ...validDefaultDomain,
            ...validDefaultDomainParsed,
            bfForms: [],
            warnings: [],
            newLanguages: [],
        }],
        expectedParams: {
            ...expectedParams,
            summary: ['The default domain will be replaced by default-domain1.yml.',
                '1 slots, 1 responses, 1 forms, 1 actions will be added from domain.yml.'],
            defaultDomain: validDefaultDomainParsed,
        },
    },
    {
        name: 'should merge rasaconfig together',
        files: [badRasaConfig, validRasaConfigPipeline, validRasaConfigPolicies,
            validRasaConfig],
        params,
        expectedFiles: [{
            ...badRasaConfig,
            errors: ['Invalid YAML.'],
        },
        {
            ...validRasaConfigPipeline,
            ...validRasaConfigPipelineParsed,
            warnings: [],
        }, {
            ...validRasaConfigPolicies,
            ...validRasaConfigPoliciesParsed,
            warnings: [],
        }, {
            ...validRasaConfig,
            ...validRasaConfigParsed,
            warnings: ['Dropped pipeline, since a pipeline for \'en\' is found in another import file.',
                'Dropped policies, since policies are already found in file configtest.yml.'],
        }],
        expectedParams: {
            ...expectedParams,
            summary: ['Pipeline for language \'en\' will be overwritten by configtest.yml.',
                'Policies will be overwritten by configtest.yml.'],
        },
    },
    {
        name: 'should keep actions from a domain that are not in stories',
        files: [storyWithAction, validDomain],
        params,
        expectedFiles: [{
            ...storyWithAction,
            ...storyWithActionParsed,
            errors: [],
            warnings: [],
        },
        {
            ...validDomain,
            ...validDomainParsed,
            newLanguages: [],
            actions: ['action_aaa'],
            bfForms: [],
            warnings: [
                {
                    longText: 'They will be added to the project\'s default domain.',
                    text: 'Some actions in domain are not explicitly mentioned in dialogue fragments.',
                },
            ],
        }],
        expectedParams: {
            ...expectedParams,
            storyGroupsUsed: [
                {
                    name: 'stories.yml',
                },
            ],
            summary: [{
                text: 'Group \'stories.yml\' will be created with 1 story.',
            },
            '2 slots, 2 responses, 1 forms, 1 actions will be added from domain.yml.'],
            existingStoryGroups: [
                {
                    name: 'stories.yml',
                },
            ],
            actionsFromFragments: [
                'action_get_help',
            ],
        },
    },
    {
        name: 'should mark a not mark a second credentials with an error when using differents envs',
        files: [{ ...validCredentials, filename: 'credentials.development.yaml' },
            { ...validCredentials, filename: 'credentials.production.yaml' }],
        params: { ...params, supportedEnvs: ['development', 'production'] },
        expectedFiles: [{
            ...validCredentials,
            env: 'development',
            credentials: validCredentialsParsed,
            filename: 'credentials.development.yaml',
            warnings: [],
        },
        {
            ...validCredentials,
            env: 'production',
            credentials: validCredentialsParsed,
            filename: 'credentials.production.yaml',
            warnings: [
            ],
        }],
        expectedParams: {
            
            ...expectedParams,
            supportedEnvs: ['development', 'production'],
            summary: ['Credentials for development will be imported from credentials.development.yaml.',
                'Credentials for production will be imported from credentials.production.yaml.'],
        },
    },
    {
        name: 'should mark a not mark a second endpoints with an error when using differents envs',
        files: [{ ...validEndpoints, filename: 'endpoints.development.yaml' },
            { ...validEndpoints, filename: 'endpoints.production.yaml' }],
        params: { ...params, supportedEnvs: ['development', 'production'] },
        expectedFiles: [{
            ...validEndpoints,
            env: 'development',
            endpoints: validEndpointsParsed,
            filename: 'endpoints.development.yaml',
            warnings: [],
        },
        {
            ...validEndpoints,
            env: 'production',
            endpoints: validEndpointsParsed,
            filename: 'endpoints.production.yaml',
            warnings: [
            ],
        }],
        expectedParams: {
            
            ...expectedParams,
            supportedEnvs: ['development', 'production'],
            summary: ['Endpoints for development will be imported from endpoints.development.yaml.',
                'Endpoints for production will be imported from endpoints.production.yaml.'],
        },
    },
    {
        name: 'should mark a not mark a second conversation with an error when using differents envs',
        files: [{ ...validConversations, filename: 'conversations.development.json' },
            { ...validConversations, filename: 'conversations.production.json' }],
        params: { ...params, supportedEnvs: ['development', 'production'] },
        expectedFiles: [{
            ...validConversations,
            env: 'development',
            conversations: validConversationsParsed,
            filename: 'conversations.development.json',
            warnings: [],
        },
        {
            ...validConversations,
            env: 'production',
            conversations: validConversationsParsed,
            filename: 'conversations.production.json',
            warnings: [
            ],
        }],
        expectedParams: {
            ...expectedParams,
            supportedEnvs: ['development', 'production'],
            summary: ['You will add 2 conversations in development',
                'You will add 2 conversations in production'],
        },
    },
    {
        name: 'should mark a not mark a second incoming with an error when using differents envs',
        files: [{ ...validIncoming, filename: 'incoming.development.json' },
            { ...validIncoming, filename: 'incoming.production.json' }],
        params: { ...params, supportedEnvs: ['development', 'production'] },
        expectedFiles: [{
            ...validIncoming,
            env: 'development',
            incoming: validIncomingParsed,
            filename: 'incoming.development.json',
            warnings: [],
        },
        {
            ...validIncoming,
            env: 'production',
            incoming: validIncomingParsed,
            filename: 'incoming.production.json',
            warnings: [
            ],
        }],
        expectedParams: {
            ...expectedParams,
            supportedEnvs: ['development', 'production'],
            summary: ['You will add 2 incoming in development',
                'You will add 2 incoming in production'],
        },
    },
];
