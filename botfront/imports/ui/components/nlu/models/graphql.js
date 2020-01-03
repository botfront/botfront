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
