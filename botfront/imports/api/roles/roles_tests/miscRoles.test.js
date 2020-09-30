import { Meteor } from 'meteor/meteor';

if (Meteor.isServer) {
    import { expect } from 'chai';
    import { setScopes } from '../../../lib/scopes';
    import { Projects, createProject } from '../../project/project.collection';
    import {
        roles, formatRoles, readers, writers,
    } from './roleTestUtils';
    // eslint-disable-next-line import/named
    import { setUpRoles } from '../roles';
    import '../../setup';


    setUpRoles();


    const projectId = 'bf';
    const modelId = 'bfModel';
    const userId = 'testuserid';
    const userData = {
        _id: 'testuserid',
        services: {
            password: {
                bcrypt:
                '$2a$10$YZwBKpTo03dZLlR1sZyCyeni3..3kAcVwG7EIZ.P0e/o6P2weEqEu',
            },
            resume: {
                loginTokens: [
                    {
                        when: '2020-02-18T16:42:18.967Z',
                        hashedToken: 'oAd1ARWfrH+OWOAWfeBRgrJ8xUS++jwcDETewvEC/uA=',
                    },
                ],
            },
        },
        emails: [{ address: 'test@test.com', verified: false }],
        profile: { firstName: 'test', lastName: 'test' },
    };
    const projectData = {
        _id: projectId,
        disabled: false,
        name: 'trial',
        namespace: 'bf-trial',
        defaultLanguage: 'en',
        defaultDomain: {
            content:
            // eslint-disable-next-line max-len
            'slots:\n  disambiguation_message:\n    type: unfeaturized\nactions:\n  - action_botfront_disambiguation\n  - action_botfront_disambiguation_followup\n  - action_botfront_fallback\n  - action_botfront_mapping',
        },
        nluThreshold: 0.75,
        timezoneOffset: 0,
        updatedAt: '2020-02-18T16:44:24.809Z',
        deploymentEnvironments: [],
    };

    const callParseNlu = async (role, scope, done) => {
        await Meteor.users.remove({ _id: userId });
        await Projects.remove({ _id: projectId });
        await Meteor.roleAssignment.remove({ user: { _id: userId } });
        await Meteor.users.insert(userData);
        await Projects.insert(projectData);
        await setScopes(formatRoles(role, scope), userId);
        try {
            const result = await parseNlu({ projectId });
            expect(result).to.not.equal(result); // parseNlu should always throw an error in this test so this line should not be reached
        } catch (err) {
            if (!readers.nluData.includes(role) || scope === 'DNE') {
                expect(err.error).to.be.equal('403');
            } else {
                expect(err.error).to.not.equal('403');
            }
        }
        done();
    };
    const callCreateProject = async (role, scope, done) => {
        await Meteor.users.remove({ _id: userId });
        await Meteor.roleAssignment.remove({ user: { _id: userId } });
        await Meteor.users.insert(userData);
        await setScopes(formatRoles(role, scope), userId);
        try {
            const result = await createProject();
            expect(result).to.not.equal(result); // createProject should always throw an error in this test so this line should not be reached
        } catch (err) {
            if (!writers.projects.includes(role) || scope !== 'GLOBAL') {
                expect(err.error).to.be.equal('403');
            } else {
                expect(err.error).to.not.equal('403');
            }
        }
        done();
    };
    describe('should test toles for miscellaneous functions', () => {
        roles.forEach((role) => {
            it(`call parseNlu as ${role} with GLOBAL scope`, (done) => {
                callParseNlu(role, 'GLOBAL', done);
            });
            it(`call parseNlu as ${role} with project scope`, (done) => {
                callParseNlu(role, projectId, done);
            });
            it(`call parseNlu as ${role} with wrong project scope`, (done) => {
                callParseNlu(role, 'DNE', done);
            });
        });
        roles.forEach((role) => {
            it(`call createProject as ${role} with GLOBAL scope`, (done) => {
                callCreateProject(role, 'GLOBAL', done);
            });
            it(`call createProject as ${role} with project scope`, (done) => {
                callCreateProject(role, projectId, done);
            });
            it(`call createProject as ${role} with wrong project scope`, (done) => {
                callCreateProject(role, 'DNE', done);
            });
        });
    });

    const addUser = async (done) => {
        await Meteor.users.remove({ _id: userId });
        await Meteor.users.insert(userData);
        done();
    };
    describe('test initialSetup method', () => {
        beforeEach((done) => {
            addUser(done);
        });
        it('should reject initial setup if a user has been created', (done) => {
            Meteor.call('initialSetup', {}, (e) => {
                expect(e.error).to.be.equal('403');
                done();
            });
        });
    });
}
