import gql from 'graphql-tag';

export const CREATE_BOT_RESPONSE = gql`
mutation createResponse($projectId: String!, $response: BotResponseInput) {
    createResponse(projectId: $projectId, response: $response){
      success
    }
}`;

export const UPDATE_BOT_RESPONSE = gql`
mutation updateResponse($projectId: String!, $_id: String!, $response: BotResponseInput) {
    updateResponse(projectId: $projectId, _id: $_id, response: $response){
      success
    }
}`;
