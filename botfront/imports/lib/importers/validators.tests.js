import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { Projects } from '../../api/project/project.collection';
import { Instances } from '../../api/instances/instances.collection';

import { singlesFiles } from './test_data/singleFiles.data';
import { multipleFiles } from './test_data/multipleFiles.data';
import { validateFiles } from '../../api/graphql/project/import.utils.js';


export function clearIdField(object) {
    const omitTypename = (key, value) => (key === '_id' ? undefined : value);
    const cleanedObject = JSON.parse(JSON.stringify(object), omitTypename);
    return cleanedObject;
}
const projectId = 'bf';


const project = {
    _id: 'bf',
    name: 'My Project',
    defaultLanguage: 'en',
    languages: ['en'],
    defaultDomain: { content: 'slots:\n  - name: disambiguation_message\n    type: unfeaturized\nactions:\n  - action_defaultdbdomain' },
    namespace: 'bf-ha',
};

const instance = {
    _id: 'testinstance',
    name: 'testinstance',
    host: 'http://localhost:1234',
    projectId: 'bf',
};
if (Meteor.isServer) {
    describe('validation pipeline with single files', () => {
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
        singlesFiles.forEach((test) => {
            const {
                name, files, params, expectedFiles, expectedParams,
            } = test;
            
            it(name, (done) => {
                validateFiles(files, params).then(([newFiles, newParams]) => {
                    expect(newFiles).to.eql(expectedFiles);
                    expect(newParams).to.eql(expectedParams);
                    done();
                }).catch(done);
            });
        });
    });

    describe('validation pipeline multiple files', () => {
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
        multipleFiles.forEach((test) => {
            const {
                name, files, params, expectedFiles, expectedParams,
            } = test;
            it(name, (done) => {
                validateFiles(files, params).then(([newFiles, newParams]) => {
                    expect(clearIdField(newFiles)).to.eql(clearIdField(expectedFiles));
                    expect(clearIdField(newParams)).to.eql(clearIdField(expectedParams));
                    done();
                }).catch(done);
            });
        });
    });
}
