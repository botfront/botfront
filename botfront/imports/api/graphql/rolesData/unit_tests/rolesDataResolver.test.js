import { expect } from 'chai';
import { Meteor } from 'meteor/meteor';


if (Meteor.isServer) {
    import { setScopes } from '../../../../lib/scopes';
    import { setUpRoles } from '../../../roles/roles';
    import roleResolver from '../resolvers/rolesDataResolver';
    import RolesData from '../rolesData.model';

    setUpRoles();
    const createRoleFixture = {
        name: 'TestRole',
        deletable: true,
        description: 'a role created during unit testing',
        children: ['global-admin'],
    };
    const editRoleFixture = {
        name: 'NewRole',
        deletable: true,
        description: 'a role created during unit testing',
        children: ['global-admin'],
    };

    const insertData = async (done) => {
        await Meteor.users.remove({ _id: 'testuserid' });
        await Meteor.roleAssignment.remove({ user: { _id: 'testuserid' } });
        await Meteor.users.insert({
            _id: 'testuserid',
            services: {},
            emails: [{ address: 'test@test.com', verified: false }],
            profile: { firstName: 'test', lastName: 'test' },
        });
        await setScopes(({ roles: [{ roles: ['global-admin'], project: 'GLOBAL' }] }), 'testuserid');
        done();
    };

    const removeTestData = async (done) => {
        await roleResolver.Mutation.deleteRolesData(null, { name: 'TestRole' },
            {
                user: {
                    _id: 'testuserid',
                    services: {},
                    emails: [{ address: 'test@test.com', verified: false }],
                    profile: { firstName: 'test', lastName: 'test' },
                },
            });
        await roleResolver.Mutation.deleteRolesData(null, { name: 'NewRole' },
            {
                user: {
                    _id: 'testuserid',
                    services: {},
                    emails: [{ address: 'test@test.com', verified: false }],
                    profile: { firstName: 'test', lastName: 'test' },
                },
            });
        done();
    };

    const createRole = async (done) => {
        const result = await roleResolver.Mutation.upsertRolesData(
            null,
            { roleData: createRoleFixture },
            {
                user: {
                    _id: 'testuserid',
                    services: {},
                    emails: [{ address: 'test@test.com', verified: false }],
                    profile: { firstName: 'test', lastName: 'test' },
                },
            },
        );
        console.log('-----');
        console.log(Meteor.roles.findOne({ _id: createRoleFixture.name }));
        console.log('-----');
        expect(Meteor.roles.findOne({ _id: createRoleFixture.name })).to.be.deep.equal({
            _id: 'TestRole',
            children: [{ _id: 'global-admin' }],
        });
        done();
    };


    const editRole = async (done) => {
        // create response
        await roleResolver.Mutation.upsertRolesData(
            null,
            { roleData: createRoleFixture },
            {
                user: {
                    _id: 'testuserid',
                    services: {},
                    emails: [{ address: 'test@test.com', verified: false }],
                    profile: { firstName: 'test', lastName: 'test' },
                },
            },
        );
        const [role] = await RolesData.find({ name: 'TestRole' });
        await roleResolver.Mutation.upsertRolesData(
            null,
            { roleData: { ...editRoleFixture, _id: role._id } },
            {
                user: {
                    _id: 'testuserid',
                    services: {},
                    emails: [{ address: 'test@test.com', verified: false }],
                    profile: { firstName: 'test', lastName: 'test' },
                },
            },
        );
        const oldRole = await RolesData.find({ name: 'TestRole' });
        const oldPermission = Meteor.roles.findOne({ _id: createRoleFixture.name });
        expect(oldRole[0]).to.be.equal(undefined);
        expect(oldPermission).to.be.equal(undefined);
        done();
    };

    describe('test roles resolver functions', () => {
        before((done) => {
            insertData(done);
        });
        afterEach((done) => {
            removeTestData(done);
        });
        it('should create a role using upsert', (done) => {
            createRole(done);
        });
        it('should edit a role using upsert and not duplicate the role on name change', (done) => {
            editRole(done);
        });
    });
}
