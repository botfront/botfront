
import { validCredentials, validCredentialsParsed } from './credentials.data.js';
import { validEndpoints, validEndpointsParsed } from './endpoints.data.js';
import { validBfConfig, validBfConfigParsed } from './bfConfig.data.js';
import { validRasaConfig, validRasaConfigParsed } from './rasaconfig.data.js';
import { validDefaultDomain, validDefaultDomainParsed } from './defaultdomain.data.js';
import { validDomain, validDomainParsed } from './domain.data.js';
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
        params: { projectId },
        expectedFiles: [{
            ...validCredentials,
            credentials: validCredentialsParsed,
        }],
        expectedParams: {
            projectId,
            summary: ['You will remplace credentials by the one in credentialstest.yml'],
            defaultDomain,
            instanceHost: 'http://localhost:1234',
            projectLanguages: [
                'en',
            ],
        },
    },
    {
        name: 'should procces a valid endpoints file',
        files: [validEndpoints],
        params: { projectId },
        expectedFiles: [{
            ...validEndpoints,
            endpoints: validEndpointsParsed,
        }],
        expectedParams: {
            projectId,
            summary: ['You will remplace endpoints by the one in endpointstest.yml'],
            defaultDomain,
            instanceHost: 'http://localhost:1234',
            projectLanguages: [
                'en',
            ],
        },
    },
    {
        name: 'should procces an valid bfconfig file',
        files: [validBfConfig],
        params: { projectId },
        expectedFiles: [{
            ...validBfConfig,
            bfconfig: validBfConfigParsed,
        }],
        expectedParams: {
            projectId,
            summary: ['You will remplace botfront config by the one in bfconfigtest.yml'],
            defaultDomain,
            instanceHost: 'http://localhost:6005',
            projectLanguages: [
                'en',
            ],
        },
    },
    {
        name: 'should procces a valid rasaconfig',
        files: [validRasaConfig],
        params: { projectId },
        expectedFiles: [{
            ...validRasaConfig,
            ...validRasaConfigParsed,
        }],
        expectedParams: {
            projectId,
            summary: ['The pipeline for the language \"en\" will be remplace by the one from the file configtest.yml', 'Policies will be remplaced by the ones from configtest.yml'],
            defaultDomain,
            instanceHost: 'http://localhost:1234',
            projectLanguages: [
                'en',
            ],
        },
    },
    {
        name: 'should procces a valid defaultDomain',
        files: [validDefaultDomain],
        params: { projectId },
        expectedFiles: [{
            ...validDefaultDomain,
            ...validDefaultDomainParsed,
            bfForms: [],
            warnings: [],
        }],
        expectedParams: {
            projectId,
            summary: ['You will remplace the default domain by default-domain1.yml'],
            defaultDomain: validDefaultDomainParsed,
            instanceHost: 'http://localhost:1234',
            projectLanguages: [
                'en',
            ],
        },
    },
    {
        name: 'should procces a valid domain',
        files: [validDomain],
        params: { projectId },
        expectedFiles: [{
            ...validDomain,
            ...validDomainParsed,
            bfForms: [],
            warnings: [],
        }],
        expectedParams: {
            projectId,
            summary: ['From domain.yml you will add: 2 slots, 3 responses, 1 actions'],
            defaultDomain,
            instanceHost: 'http://localhost:1234',
            projectLanguages: [
                'en',
            ],
        },
    },
    {
        name: 'should procces a valid conversation file',
        files: [validConversations],
        params: { projectId },
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
        },
    },
    {
        name: 'should procces a valid incoming file',
        files: [validIncoming],
        params: { projectId },
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
        },
    },
];
