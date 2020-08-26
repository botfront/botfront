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
    $cursor: String
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


export const LIST_INTENTS_AND_ENTITIES = gql`
query listIntentsAndEntities($projectId: String!, $language: String!) {
    listIntentsAndEntities(
        projectId: $projectId
        language: $language
    ) { intents, entities }
}`;


export const INTENTS_OR_ENTITIES_CHANGED = gql`
subscription intentsOrEntitiesChanged($projectId: String!, $language: String!) {
    intentsOrEntitiesChanged(
        projectId: $projectId
        language: $language
    ) { changed }
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
