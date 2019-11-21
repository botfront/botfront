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
        __typename,
        _id,
        text,
        intent,
        entities {
            value,
            entity,
            start,
            end,
            confidence
        },
        confidence,
        validated,
        createdAt,
        updatedAt
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
