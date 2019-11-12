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
    $actionFilter: [String]
    $startDate: String
    $endDate: String
    $timeZoneHoursOffset: Float
    ) {
    conversations(
        projectId: $projectId,
        skip: $skip,
        limit: $limit,
        status: ["new", "read", "flagged"],
        sort: updatedAt_DESC,
        env: $env,
        lengthFilter: $lengthFilter,
        xThanLength: $xThanLength,
        confidenceFilter: $confidenceFilter,
        xThanConfidence: $xThanConfidence,
        actionFilter: $actionFilter,
        startDate: $startDate,
        endDate: $endDate,
        timeZoneHoursOffset: $timeZoneHoursOffset
    ) 
    conversations {
        _id
        updatedAt
        status
        projectId
    }
    pages
    
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
    }
}`;
