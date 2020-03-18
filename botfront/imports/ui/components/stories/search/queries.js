import gql from 'graphql-tag';

export const SEARCH_STORIES = gql`
query stories($projectId: String! $language: String! $queryString: String!) {
    stories(projectId: $projectId language: $language queryString: $queryString) {
        _id
        storyGroupId
        title
    }
}`;
