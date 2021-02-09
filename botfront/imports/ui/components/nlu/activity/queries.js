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
        updatedAt
    }
`;

export const activityQuery = gql`
    query (
        $projectId: String!
        $language: String!
        $sortKey: String = "updatedAt"
        $sortDesc: Boolean = true
        $pageSize: Int = 20
        $cursor: String
        $validated: Boolean = false
    ) {
        getActivity(
            projectId: $projectId
            language: $language
            sortKey: $sortKey
            sortDesc: $sortDesc
            pageSize: $pageSize
            cursor: $cursor
            validated: $validated
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
