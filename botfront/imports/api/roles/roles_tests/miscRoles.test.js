import { Meteor } from 'meteor/meteor';

if (Meteor.isServer) {
    import { expect } from 'chai';
    import { setScopes } from '../../../lib/scopes';
    import { createProject } from '../../project/project.collection';
    import {
        roles, formatRoles, writers,
    } from './roleTestUtils';
    // eslint-disable-next-line import/named
    import { setUpRoles } from '../roles';
    import '../../setup';


    setUpRoles();


    const projectId = 'bf';
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
