import { expect } from 'chai';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { createTestUser } from '../../../testUtils';


if (Meteor.isServer) {
    import { setUpRoles } from '../../../roles/roles';
    import RolesData from '../rolesData.model';
    import roleResolver from '../resolvers/rolesDataResolver';
    

    setUpRoles();
    const userId = 'testuserid';
    let userData = {};
    const roleAssignmentUserId = 'roleAssignmentTestUser';
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
        userData = await createTestUser(userId, 'global-admin', 'GLOBAL');
        done();
    };

    const removeTestData = async (done) => {
        await Meteor.users.remove({ _id: userId });
        await Meteor.roleAssignment.remove({ user: { _id: userId } });
        await Meteor.users.remove({ _id: roleAssignmentUserId });
        await Meteor.roleAssignment.remove({ user: { _id: roleAssignmentUserId } });
        done();
    };

    const cleanUpTestData = async (done) => {
        await Meteor.roleAssignment.remove({ role: { _id: createRoleFixture.name } });
        await Meteor.roleAssignment.remove({ role: { _id: editRoleFixture.name } });
        await Roles.deleteRole(createRoleFixture.name);
        await Roles.deleteRole(editRoleFixture.name);
        await RolesData.remove({ name: createRoleFixture.name });
        await RolesData.remove({ name: editRoleFixture.name });
        done();
    };

    const upsertWrapper = async args => roleResolver.Mutation.upsertRolesData(
        null,
        args,
        { user: userData },
    );

    const createRole = async (done) => {
        await upsertWrapper({ roleData: createRoleFixture });
        expect(Meteor.roles.findOne({ _id: createRoleFixture.name })).to.be.deep.equal({
            _id: createRoleFixture.name,
            children: [{ _id: 'global-admin' }],
        });
        done();
    };


    const editRole = async (done) => {
        // create response
        await upsertWrapper({ roleData: createRoleFixture });
        const [role] = await RolesData.find({ name: createRoleFixture.name });
        await createTestUser(roleAssignmentUserId, createRoleFixture.name);
        await upsertWrapper({ roleData: { ...editRoleFixture, _id: role._id } });
        const oldRole = await RolesData.find({ name: createRoleFixture.name });
        const oldPermission = Meteor.roles.findOne({ _id: createRoleFixture.name });
        const roleAssignments = Meteor.roleAssignment.find({ user: { _id: roleAssignmentUserId } }).fetch();
        expect(roleAssignments).to.have.length(1);
        expect(roleAssignments[0].role._id).to.be.equal(editRoleFixture.name);
        expect(oldRole[0]).to.be.equal(undefined);
        expect(oldPermission).to.be.equal(undefined);
        done();
    };

    
    const upsertExpectingAnError = async (args) => {
        try {
            await upsertWrapper(args);
            throw new Error('upsetRolesData should have exited with an error');
        } catch (e) {
            return e.message;
        }
    };
    const attemptInvalidUpdates = async (done) => {
        // check that upserting with no name or _id fails
        const errorMessage = 'One of _id or name is required in upsertRolesData';
        expect(await upsertExpectingAnError({})).to.be.equal(errorMessage);
        expect(await upsertExpectingAnError({ name: '' })).to.be.equal(errorMessage);
        expect(await upsertExpectingAnError({ _id: '' })).to.be.equal(errorMessage);
        done();
    };

    describe('test roles resolver functions', () => {
        before((done) => {
            insertData(done);
        });
        after((done) => {
            removeTestData(done);
        });
        afterEach((done) => {
            cleanUpTestData(done);
        });
        it('should create a role using upsert', (done) => {
            createRole(done);
        });
        it('should edit a role using upsert and not duplicate the role on name change', (done) => {
            editRole(done);
        });
        it('should fail to upsert a role without a valid name or id', (done) => {
            attemptInvalidUpdates(done);
        });
    });
}
