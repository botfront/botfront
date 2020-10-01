import gql from 'graphql-tag';

export const SEARCH_STORIES = gql`
query storiesSearch($projectId: String! $language: String! $queryString: String!) {
    storiesSearch(projectId: $projectId language: $language queryString: $queryString) {
        stories {
            _id
            storyGroupId
            title
        }
    }
}`;
