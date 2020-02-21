import gql from 'graphql-tag';

export const GET_CONVERSATIONS = gql`
query retreiveConversations(
    $projectId: String!,
    $page: Int!, 
    $pageSize: Int
    $env: String
    $lengthFilter: Int
    $xThanLength: compare
    $confidenceFilter: Float
    $xThanConfidence: compare
    $actionFilters: [String]
    $startDate: String
    $endDate: String
    $timeZoneHoursOffset: Float
    $userId: String,
    $operatorActionsFilters: String,
    $operatorIntentsFilters: String,
    $intentFilters: [String]
    ) {
    conversationsPage(
        projectId: $projectId,
        page: $page, 
        pageSize: $pageSize,
        status: ["new", "read", "flagged"],
        sort: updatedAt_DESC,
        env: $env,
        lengthFilter: $lengthFilter,
        xThanLength: $xThanLength,
        confidenceFilter: $confidenceFilter,
        xThanConfidence: $xThanConfidence,
        actionFilters: $actionFilters,
        startDate: $startDate,
        endDate: $endDate,
        timeZoneHoursOffset: $timeZoneHoursOffset,
        userId: $userId
        operatorActionsFilters: $operatorActionsFilters,
        operatorIntentsFilters: $operatorIntentsFilters,
        intentFilters: $intentFilters
    ) {
        conversations {
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


export const GET_INTENTS_IN_CONVERSATIONS = gql`
    query retrieveIntentsInConversations($projectId: String!) {
        intentsInConversations(projectId: $projectId)
    }
`;
