import gql from 'graphql-tag';

export const GET_INTENT_STATISTICS = gql`
query getIntentStatistics($projectId: String!, $language: String!) {
    getIntentStatistics(
        projectId: $projectId
        language: $language
    ) {
        intent
        example
        counts { language, count }
    }
}`;


export const GET_EXAMPLES = gql`
query examples(
    $projectId: String!
    $language: String!
    $intents: [String]
    $entities: [Any]
    $onlyCanonical: Boolean
    $text: String
    $order: order
    $sortKey: String
    $pageSize: Int
    $cursor: Int
    $exactMatch: Boolean = false
) {
    examples(
        projectId: $projectId
        language: $language
        intents: $intents
        entities: $entities
        onlyCanonical: $onlyCanonical
        text: $text
        order: $order
        sortKey: $sortKey
        pageSize: $pageSize
        cursor: $cursor
        exactMatch: $exactMatch
    ) {
        examples {
            _id 
            projectId 
            text 
            intent 
            entities {
                entity
                value
                start
                end
            }
            metadata
        }
        pageInfo {
            endCursor
            hasNextPage
        }
    }
}`;


export const LIST_ENTITIES = gql`
query listIntents($projectId: String!, $language: String!) {
    listIntents(
        projectId: $projectId
        language: $language
    ) 
}`;


export const LIST_INTENTS = gql`
query listEntities($projectId: String!, $language: String!) {
    listEntities(
        projectId: $projectId
        language: $language
    ) 
}`;

export const INSERT_EXAMPLES = gql`
mutation insertExamples($projectId: String!, $language: String!, $examples: [ExampleInput]!) {
    insertExamples(projectId: $projectId, language: $language, examples: $examples) {  
        success
    }
}`;


export const DELETE_EXAMPLES = gql`
mutation deleteExamples($ids: [String]!) {
    deleteExamples(ids: $ids) 
}`;


export const SWITCH_CANONICAL = gql`
mutation switchCanonical($projectId:String, $language: String, $example: ExampleInput!) {
    switchCanonical(projectId: $projectId, language: $language, example: $example) {
             _id 
            projectId 
            text 
            intent 
            entities { value }
            metadata
    }
}`;


export const UPDATE_EXAMPLES = gql`
mutation updateExample(
    $id: String!
    $example: ExampleInput!
) {
    updateExample(
        id: $id
        example: $example
    ) {
        success
        _id
    }
}`;
