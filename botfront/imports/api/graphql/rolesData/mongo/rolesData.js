import RoleData from '../rolesData.model';

export const upsertRolesData = async roleData => RoleData.findOneAndUpdate(roleData._id ? { _id: roleData._id } : { name: roleData.name }, roleData, { upsert: true });

export const deleteRolesData = async roleData => RoleData.findOneAndDelete(roleData);

export const getRolesData = async (searchFields = {}) => {
    const { name, _id } = searchFields;
    if (_id) return RoleData.find({ _id });
    if (name) return RoleData.find({ name });
    return RoleData.find();
};
