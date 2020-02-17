import gql from 'graphql-tag';

export const GET_ROLES_DATA = gql`
    {
        getRolesData {
            name
            description
            children
            deletable
        }
    }
`;

export const UPSERT_ROLES_DATA = gql`
    mutation upsertRolesData($roleData: RoleDataInput!) {
        upsertRolesData(roleData: $roleData) {
            name
        }
    }
`;
