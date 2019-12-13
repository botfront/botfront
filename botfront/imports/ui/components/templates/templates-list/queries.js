import gql from 'graphql-tag';

export const GET_BOT_RESPONSES = gql`
query retreiveBotResponses($projectId: String!) {
    botResponses(projectId: $projectId) {
        _id
        key
        values{
            lang
            sequence {
                content
            }
        }
    }
}`;
