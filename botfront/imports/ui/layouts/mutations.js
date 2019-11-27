import gql from 'graphql-tag';

export const CREATE_BOT_RESPONSE = gql`
    mutation createResponse($projectId: String!, $response: BotResponseInput) {
        createResponse(projectId: $projectId, response: $response) {
            success
        }
    }
`;

export const UPDATE_BOT_RESPONSE = gql`
    mutation updateResponse(
        $projectId: String!
        $key: String!
        $response: BotResponseInput
    ) {
        updateResponse(projectId: $projectId, key: $key, response: $response) {
            success
        }
    }
`;

export const DELETE_BOT_RESPONSE = gql`
    mutation deleteResponse($projectId: String!, $key: String!) {
        deleteResponse(projectId: $projectId, key: $key) {
            success
        }
    }
`;
