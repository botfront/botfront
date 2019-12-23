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
        timeZoneHoursOffset: $timeZoneHoursOffset
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
      tracker {
          sender_id
          latest_message{
              text
              intent{
                  confidence
                  name
              }
              intent_ranking{
                  confidence
                  name
              }
              entities {
                      entity
                      value
                      start
                      end
                  }
          }
          events {
              event
              text
              timestamp
              name
              policy
              confidence
              message_id
              parse_data {
                  intent_ranking{
                      confidence
                      name
                  }
                  intent {
                      confidence
                      name
                  }
                  text 
                  language 
                  project 
                  entities {
                      entity
                      value
                      start
                      end
                  }
              }
          }
      }
      status
      _id
      userId
    }
}`;
