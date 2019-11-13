import gql from 'graphql-tag';

export const getActivity = gql`
query getActivity(
    $modelId: String!,
) {
    getActivity(
        modelId: $modelId,
    ) {
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
