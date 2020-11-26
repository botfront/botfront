
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

const expectedParams = {
    projectId,
    defaultDomain,
    instanceHost: 'http://localhost:1234',
    projectLanguages: [
        'en',
    ],
    fallbackLang: 'en',
    existingStoryGroups: [],
    wipeInvolvedCollections: undefined,
    wipeFragments: undefined,
    wipeNluData: [],
    actionsFromFragments: [],
};


export const multipleFiles = [
    {
        name: 'should mark a second credentials with an error',
        files: [validCredentials, validCredentials],
        params: {
            projectId,
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
        },
        expectedFiles: [{
            ...validCredentials,
            credentials: validCredentialsParsed,
        },
        {
            ...validCredentials,
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
        params: {
            projectId,
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
        },
        expectedFiles: [{
            ...validEndpoints,
            endpoints: validEndpointsParsed,
        },
        {
            ...validEndpoints,
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
        params: {
            projectId,
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
        },
        expectedFiles: [{
            ...validBfConfig,
            bfconfig: validBfConfigParsed,
        },
        {
            ...validBfConfig,
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
        params: {
            projectId,
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
        },
        expectedFiles: [{
            ...validConversations,
            conversations: validConversationsParsed,
        },
        {
            ...validConversations,
            conversations: validConversationsParsed,
        }],
        expectedParams: {
            ...expectedParams,
           
            summary: ['You will add 4 conversations'],
        },
    },
    {
        name: 'should merge the number of incomming in the files',
        files: [validIncoming, validIncoming],
        params: {
            projectId,
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
        },
        expectedFiles: [{
            ...validIncoming,
            incoming: validIncomingParsed,
        }, {
            ...validIncoming,
            incoming: validIncomingParsed,
        }],
        expectedParams: {
            ...expectedParams,
            summary: ['You will add 4 incoming'],
        },
    },
    {
        name: 'should merge default domains excluding those with errors',
        files: [invalidDefaultDomain, validDefaultDomain, validDefaultDomain2, invalidDefaultDomain],
        params: {
            projectId,
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
        },
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
                }, 'You have multiple default domain files. if some data conflicts, the one from the first file with that data will be used (same way has rasa merges domains)'],
            },
            {
                ...invalidDefaultDomain,
                errors: ['Not valid yaml: end of the stream or a document separator is expected at line 3, column 1:\n    a_message:\n    ^'],
            }],
        expectedParams: {
            ...expectedParams,
            summary: ['The default domain will be replaced by default-domain1.yml, default-domain2.yml'],
            defaultDomain: mergedDefaultDomains,
        },
    },
    {
        name: 'should remove data of domain that already exists in the default domain',
        files: [validDomain, validDefaultDomain],
        params: {
            projectId,
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
        },
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
                'forms defined in this file will be added to the default domain on import',
                {
                    longText: 'the actions that will be added to the default domain are the one that are in this file and not used directly by the rules or stories',
                    text: 'Some actions defined in this file will be added to the default domain on import',
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
            summary: ['The default domain will be replaced by default-domain1.yml',
                'From domain.yml you will add: 1 slots, 1 responses, 1 forms, 1 actions (actions ends up in the default domain)'],
            defaultDomain: validDefaultDomainParsed,
        },
    },
    {
        name: 'should merge rasaconfig together',
        files: [badRasaConfig, validRasaConfigPipeline, validRasaConfigPolicies,
            validRasaConfig],
        params: {
            projectId,
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
        },
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
        params: {
            projectId,
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
        },
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
                'forms defined in this file will be added to the default domain on import',
                {
                    longText: 'the actions that will be added to the default domain are the one that are in this file and not used directly by the rules or stories',
                    text: 'Some actions defined in this file will be added to the default domain on import',
                },
            ],
        }],
        expectedParams: {
            ...expectedParams,
            summary: [{
                text: 'Group \'stories.yml\' will be created with 1 story.',
            },
            'From domain.yml you will add: 2 slots, 2 responses, 1 forms, 1 actions (actions ends up in the default domain)'],
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
];
