import gql from 'graphql-tag';

export const activityFields = gql`
    fragment ActivityFields on Activity {
        _id,
        text,
        intent,
        entities {
            entity,
            value,
            group,
            role,
            start,
            end,
            confidence
        },
        confidence,
        validated,
        createdAt,
        updatedAt,
        message_id,
        conversation_id,
        ooS
    }
`;

export const activityQuery = gql`
    query (
        $modelId: String!,
        $env: String,
        $sortKey: String = "updatedAt",
        $sortDesc: Boolean = true,
        $pageSize: Int = 10,
        $cursor: String,
        $validated: Boolean = false,
        $ooS: Boolean = false,
        $filter: ExampleFilterInput
    ) {
        getActivity(
            modelId: $modelId,
            env: $env,
            sortKey: $sortKey,
            sortDesc: $sortDesc,
            pageSize: $pageSize,
            cursor: $cursor,
            validated: $validated,
            ooS: $ooS,
            filter: $filter
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
