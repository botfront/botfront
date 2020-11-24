import { validCredentials, validCredentialsParsed } from './credentials.data.js';
import { validEndpoints, validEndpointsParsed } from './endpoints.data.js';
import { validBfConfig, validBfConfigParsed } from './bfConfig.data.js';
import {
    validRasaConfig,
    validRasaConfigParsed,
    validRasaConfigFr,
    validRasaConfigFrParsed,
    validRasaConfigNoLang,
    validRasaConfigNoLangParsed,
} from './rasaconfig.data.js';
import { validDefaultDomain, validDefaultDomainParsed } from './defaultdomain.data.js';
import {
    validDomain,
    validDomainParsed,
    validDomainFr,
    validDomainFrParsed,
} from './domain.data.js';
import { validConversations, validConversationsParsed } from './conversation.data.js';

import { validIncoming, validIncomingParsed } from './incoming.data.js';

const projectId = 'bf';
const defaultDomain = {
    actions: ['action_defaultdbdomain'],
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
    projectLanguages: ['en'],
    fallbackLang: 'en',
    existingStoryGroups: [],
    wipeInvolvedCollections: undefined,
    wipeFragments: undefined,
    wipeProject: undefined,
    wipeNluData: [],
    actionsFromFragments: [],
};

export const singlesFiles = [
    {
        name: 'should procces a valid credentials file',
        files: [validCredentials],
        params: {
            projectId,
            projectLanguages: ['en'],
            fallbackLang: 'en',
        },
        expectedFiles: [
            {
                ...validCredentials,
                credentials: validCredentialsParsed,
            },
        ],
        expectedParams: {
            ...expectedParams,
            summary: ['Credentials will be imported from credentialstest.yml.'],
        },
    },
    {
        name: 'should procces a valid endpoints file',
        files: [validEndpoints],
        params: {
            projectId,
            projectLanguages: ['en'],
            fallbackLang: 'en',
        },
        expectedFiles: [
            {
                ...validEndpoints,
                endpoints: validEndpointsParsed,
            },
        ],
        expectedParams: {
            ...expectedParams,
            summary: ['Endpoints will be imported from endpointstest.yml.'],
        },
    },
    {
        name: 'should procces an valid bfconfig file',
        files: [validBfConfig],
        params: {
            projectId,
            projectLanguages: ['en'],
            fallbackLang: 'en',
        },
        expectedFiles: [
            {
                ...validBfConfig,
                bfconfig: validBfConfigParsed,
            },
        ],
        expectedParams: {
            ...expectedParams,
            summary: ['Botfront config will be imported from bfconfigtest.yml.'],
            instanceHost: 'http://localhost:6005',
        },
    },
    {
        name: 'should procces a valid rasaconfig',
        files: [validRasaConfig],
        params: {
            projectId,
            projectLanguages: ['en'],
            fallbackLang: 'en',
        },
        expectedFiles: [
            {
                ...validRasaConfig,
                ...validRasaConfigParsed,
                warnings: [],
            },
        ],
        expectedParams: {
            ...expectedParams,

            summary: [
                'Pipeline for language \'en\' will be overwritten by configtest.yml.',
                'Policies will be overwritten by configtest.yml.',
            ],
        },
    },
    {
        name: 'should procces a valid rasaconfig with a unsupported language',
        files: [validRasaConfigFr],
        params: {
            projectId,
            projectLanguages: ['en'],
            fallbackLang: 'en',
        },
        expectedFiles: [
            {
                ...validRasaConfigFr,
                ...validRasaConfigFrParsed,
                warnings: [],
            },
        ],
        expectedParams: {
            ...expectedParams,

            summary: [
                'Pipeline for new language model \'fr\' will be imported from configtest.yml.',
                'Policies will be overwritten by configtest.yml.',
            ],

            projectLanguages: ['en', 'fr'],
        },
    },
    {
        name: 'should procces a valid rasaconfig with a no language',
        files: [validRasaConfigNoLang],
        params: {
            projectId,
            projectLanguages: ['en'],
            fallbackLang: 'en',
        },
        expectedFiles: [
            {
                ...validRasaConfigNoLang,
                ...validRasaConfigNoLangParsed,
                language: 'en',
                warnings: ['No language specified for pipeline, using \'en\'.'],
            },
        ],
        expectedParams: {
            ...expectedParams,
            summary: [
                'Pipeline for language \'en\' will be overwritten by configtest.yml.',
                'Policies will be overwritten by configtest.yml.',
            ],
        },
    },
    {
        name: 'should procces a valid defaultDomain',
        files: [validDefaultDomain],
        params: {
            projectId,
            projectLanguages: ['en'],
            fallbackLang: 'en',
        },
        expectedFiles: [
            {
                ...validDefaultDomain,
                ...validDefaultDomainParsed,
                bfForms: [],
                warnings: [],
                newLanguages: [],
            },
        ],
        expectedParams: {
            ...expectedParams,

            summary: ['The default domain will be replaced by default-domain1.yml'],
            defaultDomain: validDefaultDomainParsed,
        },
    },
    {
        name: 'should procces a valid domain',
        files: [validDomain],
        params: {
            projectId,
            projectLanguages: ['en'],
            fallbackLang: 'en',
        },
        expectedFiles: [
            {
                ...validDomain,
                ...validDomainParsed,
                bfForms: [],
                warnings: [
                    {
                        longText: 'the actions that will be added to the default domain are the one that are in this file and not used directly by the rules or stories',
                        text: 'Some actions defined in this file will be added to the default domain on import',
                    },
                ],
                newLanguages: [],
            },
        ],
        expectedParams: {
            ...expectedParams,
            summary: ['From domain.yml you will add: 2 slots, 2 responses, 1 actions (actions ends up in the default domain)'],
        },
    },
    {
        name: 'should procces a valid conversation file',
        files: [validConversations],
        params: {
            projectId,
            projectLanguages: ['en'],
            fallbackLang: 'en',
        },
        expectedFiles: [
            {
                ...validConversations,
                conversations: validConversationsParsed,
            },
        ],
        expectedParams: {
            ...expectedParams,
            summary: ['You will add 2 conversations'],
        },
    },
    {
        name: 'should procces a valid incoming file',
        files: [validIncoming],
        params: {
            projectId,
            projectLanguages: ['en'],
            fallbackLang: 'en',
        },
        expectedFiles: [
            {
                ...validIncoming,
                incoming: validIncomingParsed,
            },
        ],
        expectedParams: {
            ...expectedParams,
            summary: ['You will add 2 incoming'],
        },
    },
    {
        name: 'should procces a valid domain with a non supported language',
        files: [validDomainFr],
        params: {
            projectId,
            projectLanguages: ['en'],
            fallbackLang: 'en',
        },
        expectedFiles: [
            {
                ...validDomainFr,
                ...validDomainFrParsed,
                bfForms: [],
                newLanguages: ['fr'],
                warnings: [
                    {
                        text: 'those reponses will add the support for the language fr :',
                        longText: 'utter_greet, utter_aaa',
                    },
                    'forms defined in this file will be added to the default domain on import',
                    {
                        longText: 'the actions that will be added to the default domain are the one that are in this file and not used directly by the rules or stories',
                        text: 'Some actions defined in this file will be added to the default domain on import',
                    },
                ],
            },
        ],
        expectedParams: {
            ...expectedParams,
            summary: [
                'From domain.yml you will add: 3 slots, 2 responses, 1 forms, 2 actions (actions ends up in the default domain)',
                'Support for the lang \'fr\' will be added using the default config',
            ],

            projectLanguages: ['en', 'fr'],
        },
    },
];
