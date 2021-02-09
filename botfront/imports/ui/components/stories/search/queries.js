import gql from 'graphql-tag';

export const SEARCH_FRAGMENTS = gql`
query dialogueSearch($projectId: String! $language: String! $queryString: String!) {
    dialogueSearch(projectId: $projectId language: $language queryString: $queryString) {
        dialogueFragments {
            _id
            storyGroupId
            type
            title
        }
        forms {
            _id
            name
            slots {
                name
            }
        }
    }
}`;
