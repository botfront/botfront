import { Roles } from 'meteor/alanning:roles';

import {
    upsertRolesData, getRolesData, deleteRolesData, removeRoleAndReassignUsers,
} from '../mongo/rolesData';
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
            // if both _id and name are undefined it can cause random roles to be deleted
            // so we make sure at least one of them is defined before we continue
            let query;
            if (updatedRoleData._id) query = { _id: updatedRoleData._id };
            else if (updatedRoleData.name) query = { name: updatedRoleData.name };
            if (!query) throw new Error('One of _id or name is required in upsertRolesData');
            const roleInDb = await getRolesData(query);
            // We have to overwrite the deletable property to be sure no one tempers with it
            updatedRoleData.deletable = roleInDb.deletable;

            if (updatedRoleData.deletable !== false) {
                updatedRoleData.deletable = true;
            } else {
                return false;
            }

            let correspondingMeteorRole = getCorrespondingMeteorRole(updatedRoleData);
            // That means it's a brand new role!
            if (!correspondingMeteorRole) {
                Roles.createRole(updatedRoleData.name, { unessExists: true });
                correspondingMeteorRole = getCorrespondingMeteorRole(updatedRoleData);
                auditLog('Created a new role', {
                    user: context.user,
                    type: 'created',
                    operation: 'role-created',
                    resId: correspondingMeteorRole.id,
                    after: { role: correspondingMeteorRole },
                    resType: 'role',
                });
            }
            if (roleInDb && roleInDb[0] && roleInDb[0].name && roleInDb[0].name !== updatedRoleData.name) {
                await removeRoleAndReassignUsers(roleInDb[0].name, updatedRoleData.name);
                auditLog('Removed a role', {
                    user: context.user,
                    type: 'deleted',
                    operation: 'role-deleted',
                    resId: roleInDb.name,
                    before: { role: roleInDb.name },
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
                type: 'updated',
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
            removeRoleAndReassignUsers(oldRole, fallbackRole);
            auditLog('Removed a role', {
                user: context.user,
                type: 'deleted',
                operation: 'role-deleted',
                resId: args.name,
                before: { role: oldRole },
                resType: 'role',
            });
            Roles.deleteRole(oldRole);
            return !!deleteRolesData({ name: oldRole });
        },
    },
};
