import gql from 'graphql-tag';

export const RESPONSE_ADDED = gql`
subscription newResponse($projectId: String!) {
    botResponseAdded(projectId: $projectId) {
        key
    }
}`;
