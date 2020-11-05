
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


export const multipleFiles = [
    {
        name: 'should mark a second credentials with an error',
        files: [validCredentials, validCredentials],
        params: { projectId },
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
        name: 'should mark a second endpoints file with an error',
        files: [validEndpoints, validEndpoints],
        params: { projectId },
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
        name: 'should mark a second bfconfig file with an error',
        files: [validBfConfig, validBfConfig],
        params: { projectId },
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
        name: 'should merge the number of conversations in the files',
        files: [validConversations, validConversations],
        params: { projectId },
        expectedFiles: [{
            ...validConversations,
            conversations: validConversationsParsed,
        },
        {
            ...validConversations,
            conversations: validConversationsParsed,
        }],
        expectedParams: {
            projectId,
            summary: ['You will add 4 conversations'],
            defaultDomain,
            instanceHost: 'http://localhost:1234',
            projectLanguages: [
                'en',
            ],
        },
    },
    {
        name: 'should merge the number of incomming in the files',
        files: [validIncoming, validIncoming],
        params: { projectId },
        expectedFiles: [{
            ...validIncoming,
            incoming: validIncomingParsed,
        }, {
            ...validIncoming,
            incoming: validIncomingParsed,
        }],
        expectedParams: {
            projectId,
            summary: ['You will add 4 incoming'],
            defaultDomain,
            instanceHost: 'http://localhost:1234',
            projectLanguages: [
                'en',
            ],
        },
    },
];
