import gql from 'graphql-tag';

const activityFields = gql`
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
`;

export const activityQuery = gql`
    query (
        $modelId: String!,
        $sortKey: String = "updatedAt",
        $sortDesc: Boolean = true,
        $pageSize: Int = 10,
        $cursor: String,
        $validated: Boolean = false,
    ) {
        getActivity(
            modelId: $modelId,
            sortKey: $sortKey,
            sortDesc: $sortDesc,
            pageSize: $pageSize,
            cursor: $cursor,
            validated: $validated,
        ) {
            activity {
                ...ActivityFields
            },
            pageInfo {
                endCursor
                hasNextPage
            }
        }
    }
    ${activityFields}
`;
