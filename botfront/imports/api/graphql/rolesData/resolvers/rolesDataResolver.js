import { Roles } from 'meteor/alanning:roles';

import { upsertRolesData, getRolesData, deleteRolesData } from '../mongo/rolesData';
import { checkIfCan } from '../../../../lib/scopes';
import { auditLog } from '../../../../../server/logger';

const getCorrespondingMeteorRole = (roleData, meteorRoles) => {
    const roles = meteorRoles ? [...meteorRoles] : Meteor.roles.find({}).fetch();
    return roles.find(role => role._id === roleData.name);
};

const flattenRoleChildren = meteorRole => meteorRole.children.map(children => children._id);

export default {
    Query: {
        getRolesData: async (_, __, context) => {
            checkIfCan('roles:r', { anyScope: true }, context.user._id);
            const rolesData = await getRolesData();
            const meteorRoles = await Meteor.roles.find({}).fetch();
            rolesData.forEach((roleData, index) => {
                rolesData[index] = roleData.toObject();
                const correspondingMeteorRole = getCorrespondingMeteorRole(
                    roleData,
                    meteorRoles,
                );
                if (!correspondingMeteorRole) {
                    deleteRolesData(roleData);
                } else {
                    rolesData[index].children = flattenRoleChildren(correspondingMeteorRole);
                }
            });
            return rolesData;
        },
    },
    Mutation: {
        upsertRolesData: async (_parent, args, context) => {
            checkIfCan('roles:w', { anyScope: true }, context.user._id);
            const updatedRoleData = { ...args.roleData };
            const roleInDb = await getRolesData(updatedRoleData.name);
            // We have to overwrite the deletable property to be sure no one tempers with it
            updatedRoleData.deletable = roleInDb.deletable;

            if (updatedRoleData.deletable !== false) {
                updatedRoleData.deletable = true;
            } else {
                return;
            }

            let correspondingMeteorRole = getCorrespondingMeteorRole(updatedRoleData);
            // That means it's a brand new role!
            if (!correspondingMeteorRole) {
                Roles.createRole(updatedRoleData.name, { unessExists: true });
                correspondingMeteorRole = getCorrespondingMeteorRole(updatedRoleData);
                auditLog('Created a new role', {
                    user: context.user,
                    type: 'create',
                    operation: 'role-created',
                    resId: correspondingMeteorRole.id,
                    after: { role: correspondingMeteorRole },
                    resType: 'role',
                });
            }

            const childrenBeforeUpdate = flattenRoleChildren(correspondingMeteorRole);

            Roles.removeRolesFromParent(childrenBeforeUpdate, updatedRoleData.name);

            Roles.addRolesToParent(updatedRoleData.children, updatedRoleData.name);
            
            const result = upsertRolesData(updatedRoleData);

            const updatedMeteorRole = getCorrespondingMeteorRole(updatedRoleData);
            // eslint-disable-next-line consistent-return
            auditLog('Updated role', {
                user: context.user,
                type: 'update',
                operation: 'role-update',
                resId: correspondingMeteorRole.id,
                after: { role: updatedMeteorRole },
                before: { role: correspondingMeteorRole },
                resType: 'role',
            });
            getCorrespondingMeteorRole(updatedRoleData);
            return result;
        },
        deleteRolesData: async (_parent, args, context) => {
            checkIfCan('roles:w', { anyScope: true }, context.user._id);
            const oldRole = args.name;
            const fallbackRole = args.fallback;
            const oldRoleAssignements = await Meteor.roleAssignment.find({ 'role._id': oldRole }).fetch();

            oldRoleAssignements.forEach((roleAssignment) => {
                const userId = roleAssignment.user._id;
                Roles.removeUsersFromRoles(userId, oldRole);
                if (roleAssignment.scope) {
                    Roles.addUsersToRoles(userId, fallbackRole, roleAssignment.scope);
                } else {
                    Roles.addUsersToRoles(userId, fallbackRole);
                }
            });
            auditLog('Removed a role', {
                user: context.user,
                type: 'delete',
                operation: 'role-deleted',
                resId: args.name,
                before: { role: oldRole },
                resType: 'role',
            });
            Roles.deleteRole(oldRole);
            deleteRolesData({ name: oldRole });
        },
    },
};
