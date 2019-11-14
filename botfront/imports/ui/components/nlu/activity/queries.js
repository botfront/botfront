import gql from 'graphql-tag';

export const getActivity = gql`

fragment ActivityFields on Activity {
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

subscription getActivity(
    $modelId: String!,
) {
    getActivity(
        modelId: $modelId,
    ) {
        ...ActivityFields
    }
}
`;
