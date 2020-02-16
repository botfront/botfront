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
