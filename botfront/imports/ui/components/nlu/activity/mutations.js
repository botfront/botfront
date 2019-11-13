import gql from 'graphql-tag';

export const upsertActivity = gql`
mutation upsertActivity(
    $modelId: String!,
    $data: [ActivityInput!]!
) {
    upsertActivity(
        modelId: $modelId,
        data: $data,
    ) {
        success
    }
}
`;

export const deleteActivity = gql`
mutation deleteActivity(
    $modelId: String!,
    $ids: [String!]!
) {
    deleteActivity(
        modelId: $modelId,
        ids: $ids,
    ) {
        success
    }
}
`;

export const addActivityToTraining = gql`
mutation addActivityToTraining(
    $modelId: String!,
    $ids: [String!]!
) {
    addActivityToTraining(
        modelId: $modelId,
        ids: $ids,
    ) {
        success
    }
}
`;
