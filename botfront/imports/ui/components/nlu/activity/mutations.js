import gql from 'graphql-tag';
import { activityFields } from './queries';

export const upsertActivity = gql`
mutation (
    $modelId: String!
    $data: [ActivityInput!]!
) {
    upsertActivity(
        modelId: $modelId,
        data: $data,
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
) {
    deleteActivity(
        modelId: $modelId,
        ids: $ids,
    ) {
        _id
        __typename
    }
}
`;
