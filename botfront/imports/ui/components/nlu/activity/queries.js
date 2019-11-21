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
        $environment: String,
        $sortKey: String = "updatedAt",
        $sortDesc: Boolean = true,
        $pageSize: Int = 10,
        $cursor: String,
        $validated: Boolean = false,
        $ooS: Boolean = false,
    ) {
        getActivity(
            modelId: $modelId,
            environment: $environment,
            sortKey: $sortKey,
            sortDesc: $sortDesc,
            pageSize: $pageSize,
            cursor: $cursor,
            validated: $validated,
            ooS: $ooS,
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
