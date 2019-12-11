import gql from 'graphql-tag';

export const GET_BOT_RESPONSES = gql`
query retreiveBotResponses($projectId: String!) {
    botResponses(projectId: $projectId) {
        key
    }
}`;

export const GET_BOT_RESPONSE = gql`
query retreiveABotResponses($projectId: String!, $key: String!, $lang: String) {
    botResponse(projectId: $projectId, key: $key, lang: $lang) {
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
