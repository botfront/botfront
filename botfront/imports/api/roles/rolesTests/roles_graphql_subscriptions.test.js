import { expect } from 'chai';

import { Meteor } from 'meteor/meteor';

// resolvers
import { subscriptionFilter as responsesSub } from '../../graphql/botResponses/resolvers/botResponsesResolver';

import { setScopes } from '../../../lib/scopes';
// eslint-disable-next-line import/named
import { setUpRoles } from '../roles'; // declared inside an if statement
import { roles, readers, formatRoles } from './rolesData';

setUpRoles(); // setting up the roles manually prevents errors from happening during the role assignment

const userId = 'testuserid';
const projectId = 'bf';

const testCases = [
    {
        name: 'botResponses',
        subFunction: responsesSub,
        variables: { projectId: 'bf' },
        payload: { projectId: 'bf' },
        acceptedRoles: readers.responses,
    },
];

const setUserScopes = async (userRoles, scope) => {
    await setScopes(formatRoles(userRoles, scope), userId);
};

const createTestUser = async () => {
    await Meteor.users.remove({ _id: 'testuserid' });
    await Meteor.users.insert({
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
    });
};
const deleteTestUser = async () => {
    await Meteor.users.remove({ _id: 'testuserid' });
    await Meteor.roleAssignment.remove({ user: { _id: userId } });
};

const testQl = async (testParams, role, scope, checkResult) => {
    const {
        subFunction,
        payload,
        variables,
    } = testParams;
    try {
        await deleteTestUser();
        // await deleteProject();
        await createTestUser();
        // await createProject();
        await setUserScopes(role, scope);
        const result = subFunction(payload, variables, { userId: 'testuserid' });
        checkResult(result);
    } catch (e) {
        if (!e || e.error !== '403') console.log(e);
        checkResult(e);
    }
};
describe('graphQL subscription roles', () => {
    testCases.forEach((testCase) => {
        roles.forEach((role) => {
            it(`subscribe to ${testCase.name} as ${role} with a global scope`, (done) => {
                testQl(testCase, role, 'GLOBAL', (result) => {
                    if (testCase.acceptedRoles.includes(role)) {
                        expect(result).to.be.equal(true);
                        done();
                        return;
                    }
                    expect(result).to.be.equal(false);
                    done();
                });
            });
            it(`subscribe to ${testCase.name} as ${role} with the right project scope`, (done) => {
                testQl(testCase, role, projectId, (result) => {
                    if (testCase.acceptedRoles.includes(role)) {
                        expect(result).to.be.equal(true);
                        done();
                        return;
                    }
                    expect(result).to.be.equal(false);
                    done();
                });
            });
            it(`subscribe to ${testCase.name} as ${role} with the wrong scope`, (done) => {
                testQl(testCase, role, 'DNE', (result) => {
                    expect(result).to.be.equal(false);
                    done();
                });
            });
        });
    });
});
