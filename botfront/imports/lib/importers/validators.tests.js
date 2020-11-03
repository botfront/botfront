import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { Projects } from '../../api/project/project.collection';
import { Instances } from '../../api/instances/instances.collection';

import { validCredentials, validCredentialsParsed } from './test_data/credentials.data.js';
import { validEndpoints, validEndpointsParsed } from './test_data/endpoints.data.js';
import { validInstance, validInstanceParsed } from './test_data/instances.data.js';
import { validRasaConfig, validRasaConfigParsed } from './test_data/rasaconfig.data.js';
import { validDefaultDomain, validDefaultDomainParsed } from './test_data/defaultdomain.data.js';
import { validDomain, validDomainParsed } from './test_data/domain.data.js';


import { validateFiles } from '../../api/graphql/project/import.utils.js';

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

const project = {
    _id: 'bf',
    name: 'My Project',
    defaultLanguage: 'en',
    languages: ['en'],
    defaultDomain: { content: 'slots:\n  - name: disambiguation_message\n    type: unfeaturized\nactions:\n  - action_defaultdbdomain' },
};

const instance = {
    _id: 'testinstance',
    name: 'testinstance',
    host: 'http://localhost:5005',
    projectId: 'bf',
};

const projectId = 'bf';

const testDataFiles = [
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
            instanceHost: 'http://localhost:5005',
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
            instanceHost: 'http://localhost:5005',
            projectLanguages: [
                'en',
            ],
        },
    },
    {
        name: 'should procces an valid instance file',
        files: [validInstance],
        params: { projectId },
        expectedFiles: [{
            ...validInstance,
            instance: validInstanceParsed,
        }],
        expectedParams: {
            projectId,
            summary: ['You will remplace instance by the one in instancetest.yml'],
            defaultDomain,
            instanceHost: 'http://localhost:5005',
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
            instanceHost: 'http://localhost:5005',
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
            summary: ['You will remplace the default domain by default-domain.yml'],
            defaultDomain: validDefaultDomainParsed,
            instanceHost: 'http://localhost:5005',
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
            summary: ['From domain.yml you will add: 1 slots, 3 responses, 4 actions'],
            defaultDomain,
            instanceHost: 'http://localhost:5005',
            projectLanguages: [
                'en',
            ],
        },
    },
    // {
    //     name: 'should procces a valid conversation file',
    //     files: [],
    //     params: { projectId },
    //     expectedFiles: [],
    //     expectedParams: {},
    // },
    // {
    //     name: 'should procces a valid incoming file',
    //     files: [],
    //     params: { projectId },
    //     expectedFiles: [],
    //     expectedParams: {},
    // },
    // {
    //     name: 'should procces a valid default domain file',
    //     files: [],
    //     params: { projectId },
    //     expectedFiles: [],
    //     expectedParams: {},
    // },
    // {
    //     name: 'should procces a valid domain file',
    //     files: [],
    //     params: { projectId },
    //     expectedFiles: [],
    //     expectedParams: {},
    // },
    //
];

if (Meteor.isServer) {
    describe.only('validation pipeline with single files', () => {
        before(async(done) => {
            await Projects.insert(project);
            await Instances.insert(instance);
            done();
        });

        after(async(done) => {
            await Projects.remove({ _id: projectId });
            await Instances.remove({ projectId });
            done();
        });
        testDataFiles.forEach((test) => {
            const {
                name, files, params, expectedFiles, expectedParams,
            } = test;
            it(name, () => {
                const [newFiles, newParams] = validateFiles(files, params);
                expect(newFiles).to.eql(expectedFiles);
                expect(newParams).to.eql(expectedParams);
            });
        });
    });
    // describe('validation pipeline with bad files', () => {
    //     testDataFiles.forEach((test) => {
    //         const {
    //             name, files, params, expectedFiles, expectedParams,
    //         } = test;
    //         it(name, () => {
    //             const [newFiles, newParams] = validateFiles(files, params);
    //             expect(newFiles).to.equal(expectedFiles);
    //             expect(newParams).to.equal(expectedParams);
    //         });
    //     });
    // });
    // describe('validation pipeline multiple files', () => {
    //     testDataFiles.forEach((test) => {
    //         const {
    //             name, files, params, expectedFiles, expectedParams,
    //         } = test;
    //         it(name, () => {
    //             const [newFiles, newParams] = validateFiles(files, params);
    //             expect(newFiles).to.equal(expectedFiles);
    //             expect(newParams).to.equal(expectedParams);
    //         });
    //     });
    // });
}
