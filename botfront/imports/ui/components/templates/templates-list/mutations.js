import gql from 'graphql-tag';

export const DELETE_BOT_RESPONSE = gql`
mutation deleteResponse($projectId: String!, $key: String!) {
    deleteResponse(projectId: $projectId, key: $key){
      success
    }
}`;
