import RoleData from '../rolesData.model';

export const upsertRolesData = async roleData => RoleData.findOneAndUpdate({ name: roleData.name }, roleData, { upsert: true });

export const deleteRolesData = async roleData => RoleData.findOneAndDelete(roleData);

export const getRolesData = async (name) => {
    if (name) return RoleData.find({ name });
    return RoleData.find();
};
