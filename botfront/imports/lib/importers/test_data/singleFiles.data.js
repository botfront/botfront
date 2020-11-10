
import { validCredentials, validCredentialsParsed } from './credentials.data.js';
import { validEndpoints, validEndpointsParsed } from './endpoints.data.js';
import { validBfConfig, validBfConfigParsed } from './bfConfig.data.js';
import { validRasaConfig, validRasaConfigParsed } from './rasaconfig.data.js';
import { validDefaultDomain, validDefaultDomainParsed } from './defaultdomain.data.js';
import {
    validDomain, validDomainParsed, validDomainFr, validDomainFrParsed,
} from './domain.data.js';
import { validConversations, validConversationsParsed } from './conversation.data.js';

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


export const singlesFiles = [
    {
        name: 'should procces a valid credentials file',
        files: [validCredentials],
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
        }],
        expectedParams: {
            projectId,
            summary: ['Credentials will be imported from credentialstest.yml.'],
            defaultDomain,
            instanceHost: 'http://localhost:1234',
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
            existingStoryGroups: [],
        },
    },
    {
        name: 'should procces a valid endpoints file',
        files: [validEndpoints],
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
        }],
        expectedParams: {
            projectId,
            summary: ['Endpoints will be imported from endpointstest.yml.'],
            defaultDomain,
            instanceHost: 'http://localhost:1234',
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
            existingStoryGroups: [],
        },
    },
    {
        name: 'should procces an valid bfconfig file',
        files: [validBfConfig],
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
        }],
        expectedParams: {
            projectId,
            summary: ['Botfront config will be imported from bfconfigtest.yml.'],
            defaultDomain,
            instanceHost: 'http://localhost:6005',
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
            existingStoryGroups: [],
        },
    },
    {
        name: 'should procces a valid rasaconfig',
        files: [validRasaConfig],
        params: {
            projectId,
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
        },
        expectedFiles: [{
            ...validRasaConfig,
            ...validRasaConfigParsed,
            warnings: [],
        }],
        expectedParams: {
            projectId,
            summary: ['Pipeline for language \'en\' will be overwritten by configtest.yml.', 'Policies will be overwritten by configtest.yml.'],
            defaultDomain,
            instanceHost: 'http://localhost:1234',
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
            existingStoryGroups: [],
        },
    },
    {
        name: 'should procces a valid defaultDomain',
        files: [validDefaultDomain],
        params: {
            projectId,
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
        },
        expectedFiles: [{
            ...validDefaultDomain,
            ...validDefaultDomainParsed,
            bfForms: [],
            warnings: [],
            newLanguages: [],
        }],
        expectedParams: {
            projectId,
            summary: ['You will remplace the default domain by default-domain1.yml'],
            defaultDomain: validDefaultDomainParsed,
            instanceHost: 'http://localhost:1234',
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
            existingStoryGroups: [],
        },
    },
    {
        name: 'should procces a valid domain',
        files: [validDomain],
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
            bfForms: [],
            warnings: [],
            newLanguages: [],
        }],
        expectedParams: {
            projectId,
            summary: ['From domain.yml you will add: 2 slots, 2 responses, 1 actions'],
            defaultDomain,
            instanceHost: 'http://localhost:1234',
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
            existingStoryGroups: [],
        },
    },
    {
        name: 'should procces a valid conversation file',
        files: [validConversations],
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
        }],
        expectedParams: {
            projectId,
            summary: ['You will add 2 conversations'],
            defaultDomain,
            instanceHost: 'http://localhost:1234',
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
            existingStoryGroups: [],
        },
    },
    {
        name: 'should procces a valid incoming file',
        files: [validIncoming],
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
        }],
        expectedParams: {
            projectId,
            summary: ['You will add 2 incoming'],
            defaultDomain,
            instanceHost: 'http://localhost:1234',
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
            existingStoryGroups: [],
        },
    },
    {
        name: 'should procces a valid domain with a non supported language',
        files: [validDomainFr],
        params: {
            projectId,
            projectLanguages: [
                'en',
            ],
            fallbackLang: 'en',
        },
        expectedFiles: [{
            ...validDomainFr,
            ...validDomainFrParsed,
            bfForms: [],
            newLanguages: ['fr'],
            warnings: [{
                text: 'those reponses will add the support for the language fr :',
            },
            {
                longText: 'utter_greet, utter_aaa',
            }],
        }],
        expectedParams: {
            projectId,
            summary: ['From domain.yml you will add: 2 slots, 2 responses, 1 actions'],
            defaultDomain,
            instanceHost: 'http://localhost:1234',
            projectLanguages: [
                'en', 'fr',
            ],
            fallbackLang: 'en',
            existingStoryGroups: [],
            
        },
    },
];
