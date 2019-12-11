import gql from 'graphql-tag';

export const RESPONSES_MODIFIED = gql`
subscription responsesModified($projectId: String!) {
    botResponsesModified(projectId: $projectId) {
        key
        values{
            lang
            sequence {
                content
            }
        }
    }
}`;

export const RESPONSES_DELETED = gql`
subscription responseDeleted($projectId: String!) {
    botResponseDeleted(projectId: $projectId) {
        key
        values{
            lang
            sequence {
                content
            }
        }
    }
}`;
