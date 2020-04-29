import { Roles } from 'meteor/alanning:roles';
import RoleData from '../rolesData.model';

export const upsertRolesData = async roleData => RoleData.findOneAndUpdate(roleData._id ? { _id: roleData._id } : { name: roleData.name }, roleData, { upsert: true, new: true, lean: true });

export const deleteRolesData = async roleData => RoleData.findOneAndDelete(roleData).lean();

export const getRolesData = async (searchFields = {}) => {
    const { name, _id } = searchFields;
    if (_id) return RoleData.find({ _id });
    if (name) return RoleData.find({ name });
    return RoleData.find();
};

export const removeRoleAndReassignUsers = async (oldRole, newRole) => {
    const oldRoleAssignements = await Meteor.roleAssignment.find({ 'role._id': oldRole }).fetch();

    const reassignments = oldRoleAssignements.map(roleAssignment => new Promise(async (resolve, reject) => {
        try {
            const userId = roleAssignment.user._id;
            Roles.removeUsersFromRoles(userId, oldRole);
            if (roleAssignment.scope) {
                await Roles.addUsersToRoles(userId, newRole, roleAssignment.scope);
                resolve();
            } else {
                await Roles.addUsersToRoles(userId, newRole);
                resolve();
            }
        } catch (e) {
            reject(e);
        }
    }));
    await Promise.all(reassignments);
    await Roles.deleteRole(oldRole);
    await deleteRolesData({ name: oldRole });
};
