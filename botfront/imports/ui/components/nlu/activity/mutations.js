import gql from 'graphql-tag';

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
        updatedAt,
        ooS
    }
}
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
        _id,
        __typename
    }
}
`;
