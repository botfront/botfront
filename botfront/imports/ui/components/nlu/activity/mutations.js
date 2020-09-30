import gql from 'graphql-tag';
import { activityFields } from './queries';

export const upsertActivity = gql`
mutation (
    $projectId: String!
    $language: String!
    $data: [ActivityInput!]!
) {
    upsertActivity(
        projectId: $projectId
        language: $language
        data: $data
    ) {
        __typename
        ...ActivityFields
    }
}
${activityFields}
`;

export const deleteActivity = gql`
mutation (
    $projectId: String!
    $language: String!
    $ids: [String!]!
) {
    deleteActivity(
        projectId: $projectId
        language: $language
        ids: $ids
    ) {
        _id
        __typename
    }
}
`;
