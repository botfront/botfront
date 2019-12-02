import gql from 'graphql-tag';

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
    }
}`;
