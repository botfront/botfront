import gql from 'graphql-tag';

export const GET_ROLES_DATA = gql`
    {
        getRolesData {
            _id
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

export const DELETE_ROLE_DATA = gql`
    mutation deleteRolesData($name: String!, $fallback: String!) {
        deleteRolesData(name: $name, fallback: $fallback)
    }
`;
