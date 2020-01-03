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
        metadata
    }
}`;

export const GET_BOT_RESPONSE_BY_ID = gql`
query retreiveBotResponses($_id: String!) {
    botResponseById(_id: $_id) {
        _id
        key
        values{
            lang
            sequence {
                content
            }
        }
        metadata
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
        metadata
    }
}`;
