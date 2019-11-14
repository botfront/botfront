import gql from 'graphql-tag';

export const getValidatedActivity = gql`
query getValidatedActivity(
    $modelId: String!
) {
    getActivity(
        modelId: $modelId,
        validated: true,
    ) {
        ...ActivityFields
    }
}
`;
