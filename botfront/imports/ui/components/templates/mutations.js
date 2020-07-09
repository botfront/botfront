import gql from 'graphql-tag';

export const DELETE_BOT_RESPONSE = gql`
mutation deleteResponse($projectId: String!, $key: String!) {
    deleteResponse(projectId: $projectId, key: $key){
      success
    }
}`;

export const UPSERT__FULL_BOT_RESPONSE = gql`
mutation upsertFullResponse($projectId: String!, $_id: String, $key: String, $response: BotResponseInput) {
  upsertFullResponse(projectId: $projectId, _id: $_id, key: $key, response: $response){
      success
      _id
    }
}`;

export const CREATE_AND_OVERWRITE_RESPONSES = gql`
mutation createAndOverwriteResponses($projectId: String!, $responses: [BotResponseInput]) {
  createAndOverwriteResponses(projectId: $projectId, responses: $responses){
      key
    }
}`;

export const DELETE_VARIATION = gql`
mutation deleteVariation($projectId: String!, $key: String!, $language: String!, $index: Int!) {
  deleteVariation(projectId: $projectId, key: $key, language: $language, index: $index){
    success
  }
}`;
