import gql from 'graphql-tag';
import { activityFields } from './queries';

export const upsertActivity = gql`
mutation (
    $modelId: String!
    $data: [ActivityInput!]!
    $isOoS: Boolean
) {
    upsertActivity(
        modelId: $modelId,
        data: $data,
        isOoS: $isOoS,
    ) {
        __typename
        ...ActivityFields
    }
}
${activityFields}
`;

export const deleteActivity = gql`
mutation (
    $modelId: String!
    $ids: [String!]!
    $isOoS: Boolean
) {
    deleteActivity(
        modelId: $modelId,
        ids: $ids,
        isOoS: $isOoS,
    ) {
        _id
        __typename
    }
}
`;
