import gql from 'graphql-tag';

export const GET_CONVERSATIONS = gql`
query retreiveConversations(
    $projectId: String!
    $page: Int!
    $pageSize: Int
    $fetchTrackers: Boolean = false
) {
    conversationsPage(projectId: $projectId, page: $page, pageSize: $pageSize, status: ["new", "read", "flagged"], sort: updatedAt_DESC) {
        conversations{
            _id
            updatedAt
            status
            projectId
            userId
            tracker @include(if: $fetchTrackers)
            createdAt @include(if: $fetchTrackers)
            env @include(if: $fetchTrackers)
            language @include(if: $fetchTrackers)
        }
        pages
    }
}`;

export const GET_CONVERSATION = gql`
query retreiveAConversation($projectId: String!, $conversationId: String!) {
    conversation(projectId: $projectId, id: $conversationId ) {
        tracker
        status
        _id
        userId
    }
}`;
