import gql from 'graphql-tag';

export const GET_CONVERSATIONS = gql`
query retreiveConversations($projectId: String!,$page: Int!, $pageSize: Int) {
    conversationsPage(projectId: $projectId, page: $page, pageSize: $pageSize, status: ["new", "read", "flagged"], sort: updatedAt_DESC) {
        conversations{
            _id
            updatedAt
            status
            projectId
            userId
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
