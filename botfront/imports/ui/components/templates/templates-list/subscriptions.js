import gql from 'graphql-tag';

export const RESPONSES_MODIFIED = gql`
subscription responsesModified($projectId: String!) {
    botResponsesModified(projectId: $projectId) {
        key
        _id
        values{
            lang
            sequence {
                content
            }
        }
        metadata
    }
}`;

export const RESPONSES_DELETED = gql`
subscription responseDeleted($projectId: String!) {
    botResponseDeleted(projectId: $projectId) {
        key
        _id
        values{
            lang
            sequence {
                content
            }
        }
        metadata
    }
}`;
