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
            confidence,
            extractor
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
        $projectId: String!
        $language: String!
        $env: String
        $sortKey: String = "updatedAt"
        $sortDesc: Boolean = true
        $pageSize: Int = 10
        $cursor: String
        $validated: Boolean = false
        $ooS: Boolean = false
        $filter: ExampleFilterInput
    ) {
        getActivity(
            projectId: $projectId
            language: $language
            env: $env
            sortKey: $sortKey
            sortDesc: $sortDesc
            pageSize: $pageSize
            cursor: $cursor
            validated: $validated
            ooS: $ooS
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
