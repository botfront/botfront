import gql from 'graphql-tag';

export const upsertActivity = gql`
mutation (
    $modelId: String!,
    $data: [ActivityInput!]!
) {
    upsertActivity(
        modelId: $modelId,
        data: $data,
    ) {
        _id,
        __typename,
        validated,
    }
}
`;

export const deleteActivity = gql`
mutation (
    $modelId: String!,
    $ids: [String!]!
) {
    deleteActivity(
        modelId: $modelId,
        ids: $ids,
    ) {
        _id,
        __typename
    }
}
`;

export const addActivityToTraining = gql`
mutation (
    $modelId: String!,
    $ids: [String!]!
) {
    addActivityToTraining(
        modelId: $modelId,
        ids: $ids,
    ) {
        _id,
        __typename
    }
}
`;
