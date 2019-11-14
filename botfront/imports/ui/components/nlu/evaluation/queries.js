import gql from 'graphql-tag';

export const getValidatedActivity = gql`
query getValidatedActivity(
    $modelId: String!
) {
    getActivity(
        modelId: $modelId,
        validated: true,
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
