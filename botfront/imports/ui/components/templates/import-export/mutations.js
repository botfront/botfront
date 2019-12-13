import gql from 'graphql-tag';

export const ADD_BOT_RESPONSES = gql`
    mutation createResponses($projectId: String!, $responses: String) {
        createResponses(projectId: $projectId, responses: $responses) {
            success
        }
    }
`;
