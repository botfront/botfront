import { setScopes } from '../lib/scopes';

export const createTestUser = async (
    _id = 'testuserid',
    roles = ['global-admin'],
    scope = 'GLOBAL') => {
    await Meteor.users.remove({ _id });
    await Meteor.roleAssignment.remove({ user: { _id } });
    const userData = {
        _id,
        services: {},
        emails: [{ address: `${_id}@test.com`, verified: false }],
        profile: { firstName: _id, lastName: 'test' },
    };
    await Meteor.users.insert(userData);
    await setScopes(({ roles: [{ roles, project: scope }] }), _id);
    return userData;
};

export const removeTestUser = async (userId = 'testuserid') => {
    await Meteor.users.remove({ _id: userId });
    await Meteor.roleAssignment.remove({ user: { _id: userId } });
};
