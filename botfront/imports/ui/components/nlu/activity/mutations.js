import gql from 'graphql-tag';
import { activityFields } from './queries';

export const upsertActivity = gql`
mutation (
    $projectId: String!
    $language: String!
    $data: [ActivityInput!]!
    $isOoS: Boolean
) {
    upsertActivity(
        projectId: $projectId
        language: $language
        data: $data
        isOoS: $isOoS
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
    $isOoS: Boolean
) {
    deleteActivity(
        projectId: $projectId
        language: $language
        ids: $ids
        isOoS: $isOoS
    ) {
        _id
        __typename
    }
}
`;
