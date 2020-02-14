import { upsertRolesData, getRolesData, deleteRolesData } from '../mongo/rolesData';

export default {
    Query: {
        getRolesData: async () => getRolesData(),
    },
    Mutation: {
        upsertRolesData: (_parent, args) => upsertRolesData(args),
        deleteRolesData: (_parent, args) => deleteRolesData(args),
    },
};
