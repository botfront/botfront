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
import {
    validAnalytics,
    validAnalyticsParsed,
} from './analytics.data.js';
import {
    validWidgetSettings,
    validWidgetSettingsParsed,
} from './widgetsettings.data.js';
import {
    validFormResults,
    validFormResultsParsed,
} from './formresults.data.js';

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

const params = {
    projectId,
    projectLanguages: ['en'],
    fallbackLang: 'en',
    supportedEnvs: ['development'],
};

const expectedParams = {
    projectId,
    defaultDomain,
    instanceHost: 'http://localhost:1234',
    instanceToken: undefined,
    projectLanguages: ['en'],
    fallbackLang: 'en',
    existingStoryGroups: [],
    wipeInvolvedCollections: undefined,
    wipeFragments: undefined,
    wipeProject: undefined,
    wipeNluData: [],
    actionsFromFragments: [],
    supportedEnvs: ['development'],
    storyGroupsUsed: [],
};

export const singlesFiles = [
    {
        name: 'should procces a valid credentials file',
        files: [validCredentials],
        params,
        expectedFiles: [
            {
                ...validCredentials,
                credentials: validCredentialsParsed,
                env: 'development',
                warnings: [],
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
        params,
        expectedFiles: [
            {
                ...validEndpoints,
                endpoints: validEndpointsParsed,
                env: 'development',
                warnings: [],
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
        params,
        expectedFiles: [
            {
                ...validBfConfig,
                bfconfig: validBfConfigParsed,
                env: 'development',
                warnings: [],
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
        params,
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
        params,
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
        params,
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
        params,
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

            summary: ['The default domain will be replaced by default-domain1.yml.'],
            defaultDomain: validDefaultDomainParsed,
        },
    },
    {
        name: 'should procces a valid domain',
        files: [validDomain],
        params,
        expectedFiles: [
            {
                ...validDomain,
                ...validDomainParsed,
                bfForms: [],
                warnings: [
                    {
                        longText: 'They will be added to the project\'s default domain.',
                        text: 'Some actions in domain are not explicitly mentioned in dialogue fragments.',
                    },
                ],
                newLanguages: [],
            },
        ],
        expectedParams: {
            ...expectedParams,
            summary: ['2 slots, 2 responses, 1 forms, 1 actions will be added from domain.yml.'],
        },
    },
    {
        name: 'should procces a valid conversation file',
        files: [validConversations],
        params,
        expectedFiles: [
            {
                ...validConversations,
                conversations: validConversationsParsed,
                env: 'development',
                warnings: [],
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
        params,
        expectedFiles: [
            {
                ...validIncoming,
                incoming: validIncomingParsed,
                env: 'development',
                warnings: [],
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
        params,
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
                    {
                        longText: 'They will be added to the project\'s default domain.',
                        text: 'Some actions in domain are not explicitly mentioned in dialogue fragments.',
                    },
                ],
            },
        ],
        expectedParams: {
            ...expectedParams,
            summary: [
                'Support for language \'fr\' will be added using the default config.',
                '3 slots, 2 responses, 1 forms, 2 actions will be added from domain.yml.',
            ],

            projectLanguages: ['en', 'fr'],
        },
    },
    {
        name: 'should procces a valid credentials file in prod when prod is supported',
        files: [{ ...validCredentials, filename: 'credentials.production.yaml' }],
        params: {
            ...params,
            supportedEnvs: ['development', 'production'],
        },
        expectedFiles: [
            {
                ...validCredentials,
                credentials: validCredentialsParsed,
                env: 'production',
                warnings: [],
                filename: 'credentials.production.yaml',
            },
        ],
        expectedParams: {
            ...expectedParams,
            storyGroupsUsed: [],
            supportedEnvs: ['development', 'production'],
            summary: ['Credentials for production will be imported from credentials.production.yaml.'],
        },
    },
    {
        name: 'should procces a valid credentials file in prod when prod is not supported',
        files: [{ ...validCredentials, filename: 'credentials.production.yaml' }],
        params,
        expectedFiles: [
            {
                ...validCredentials,
                credentials: validCredentialsParsed,
                env: 'production',
                warnings: ['The "production" environment is not supported by this project, this file won\'t be used in the import'],
                filename: 'credentials.production.yaml',
            },
        ],
        expectedParams: {
            ...expectedParams,
            storyGroupsUsed: [],
            supportedEnvs: ['development'],
            summary: [],
        },
    },
    {
        name: 'should procces a valid endpoints file in prod when prod is supported',
        files: [{ ...validEndpoints, filename: 'endpoints.production.yaml' }],
        params: {
            ...params,
            supportedEnvs: ['development', 'production'],
        },
        expectedFiles: [
            {
                ...validEndpoints,
                endpoints: validEndpointsParsed,
                env: 'production',
                filename: 'endpoints.production.yaml',
                warnings: [],
            },
        ],
        expectedParams: {
            ...expectedParams,
            supportedEnvs: ['development', 'production'],
            summary: ['Endpoints for production will be imported from endpoints.production.yaml.'],
        },
    },
    {
        name: 'should procces a valid endpoints file in prod when prod is not supported',
        files: [{ ...validEndpoints, filename: 'endpoints.production.yaml' }],
        params,
        expectedFiles: [
            {
                ...validEndpoints,
                endpoints: validEndpointsParsed,
                env: 'production',
                filename: 'endpoints.production.yaml',
                warnings: ['The "production" environment is not supported by this project, this file won\'t be used in the import'],
            },
        ],
        expectedParams: {
            ...expectedParams,
            summary: [],
        },
    },
    {
        name: 'should procces a valid conversation file in prod when prod is supported',
        files: [{ ...validConversations, filename: 'conversations.production.json' }],
        params: { ...params, supportedEnvs: ['development', 'production'] },
        expectedFiles: [
            {
                ...validConversations,
                conversations: validConversationsParsed,
                warnings: [],
                env: 'production',
                filename: 'conversations.production.json',
            },
        ],
        expectedParams: {
            ...expectedParams,
            supportedEnvs: ['development', 'production'],
            summary: [
                'You will add 2 conversations in production',
            ],
        },
    },
    {
        name: 'should procces a valid conversation file in prod when prod is not supported',
        files: [{ ...validConversations, filename: 'conversations.production.json' }],
        params,
        expectedFiles: [
            {
                ...validConversations,
                conversations: validConversationsParsed,
                env: 'production',
                filename: 'conversations.production.json',
                warnings: ['The "production" environment is not supported by this project, this file won\'t be used in the import'],
            },
        ],
        expectedParams: {
            ...expectedParams,
            summary: [],
        },
    },
    {
        name: 'should procces a valid incoming file in prod when prod is supported',
        files: [{ ...validIncoming, filename: 'incoming.production.json' }],
        params: { ...params, supportedEnvs: ['development', 'production'] },
        expectedFiles: [
            {
                ...validIncoming,
                incoming: validIncomingParsed,
                warnings: [],
                env: 'production',
                filename: 'incoming.production.json',
            },
        ],
        expectedParams: {
            ...expectedParams,
            supportedEnvs: ['development', 'production'],
            summary: [
                'You will add 2 incoming in production',
            ],
        },
    },
    {
        name: 'should procces a valid incoming file when prod is not supported',
        files: [{ ...validIncoming, filename: 'incoming.production.json' }],
        params,
        expectedFiles: [
            {
                ...validIncoming,
                incoming: validIncomingParsed,
                env: 'production',
                filename: 'incoming.production.json',
                warnings: ['The "production" environment is not supported by this project, this file won\'t be used in the import'],
            },
        ],
        expectedParams: {
            ...expectedParams,
            summary: [],
        },
    },
    {
        name: 'should procces a valid anlytics config file',
        files: [validAnalytics],
        params,
        expectedFiles: [
            {
                ...validAnalytics,
                analytics: validAnalyticsParsed,
                env: 'development',
                warnings: [],
            },
        ],
        expectedParams: {
            ...expectedParams,
            summary: ['Analytics config will be imported from analyticsconfig.yml.'],
        },
    },
    {
        name: 'should procces a widget config file',
        files: [validWidgetSettings],
        params,
        expectedFiles: [
            {
                ...validWidgetSettings,
                widgetsettings: validWidgetSettingsParsed,
                env: 'development',
                warnings: [],
            },
        ],
        expectedParams: {
            ...expectedParams,
            summary: ['Widget config will be imported from widgetsettings.yml.'],
        },
    },
    {
        name: 'should procces a form result file',
        files: [validFormResults],
        params,
        expectedFiles: [
            {
                ...validFormResults,
                formresults: validFormResultsParsed,
                env: 'development',
                warnings: [],
            },
        ],
        expectedParams: {
            ...expectedParams,
            summary: ['You will add 2 form results'],
        },
    },
];
