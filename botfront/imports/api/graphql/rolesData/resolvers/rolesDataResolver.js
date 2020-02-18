import { Roles } from 'meteor/alanning:roles';

import { upsertRolesData, getRolesData, deleteRolesData } from '../mongo/rolesData';
import { checkIfCan } from '../../../roles/roles';

const getCorrespondingMeteorRole = (roleData, meteorRoles) => {
    const roles = meteorRoles ? [...meteorRoles] : Meteor.roles.find({}).fetch();
    return roles.find(role => role._id === roleData.name);
};

const flattenRoleChildren = meteorRole => meteorRole.children.map(children => children._id);

export default {
    Query: {
        getRolesData: async (_, __, context) => {
            checkIfCan('roles:r', null, context.user._id);
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
        upsertRolesData: async (_parent, args) => {
            const updatedRoleData = { ...args.roleData };
            const roleInDb = await getRolesData(updatedRoleData.name);
            // We have to overwrite the deletable property to be sure no one tempers with it
            updatedRoleData.deletable = roleInDb.deletable;

            if (updatedRoleData.deletable !== false) {
                updatedRoleData.deletable = true;
            } else {
                return;
            }

            const correspondingMeteorRole = getCorrespondingMeteorRole(updatedRoleData);

            const childrenBeforeUpdate = flattenRoleChildren(correspondingMeteorRole);

            Roles.removeRolesFromParent(childrenBeforeUpdate, updatedRoleData.name);

            Roles.addRolesToParent(updatedRoleData.children, updatedRoleData.name);

            // eslint-disable-next-line consistent-return
            return upsertRolesData(updatedRoleData);
        },
        deleteRolesData: (_parent, args) => deleteRolesData(args),
    },
};
