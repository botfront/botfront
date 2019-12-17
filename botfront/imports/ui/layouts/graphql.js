import gql from 'graphql-tag';

export const RESPONSE_ADDED = gql`
subscription newResponse($projectId: String!) {
    botResponseAdded(projectId: $projectId) {
        key
    }
}`;

export const GET_BOT_RESPONSES = gql`
query retreiveBotResponses($projectId: String!) {
    botResponses(projectId: $projectId) {
        key
    }
}`;

export const GET_BOT_RESPONSE = gql`
query getResponse($template: StringOrListOfStrings!, $projectId: String!, $language: StringOrListOfStrings!) {
    getResponse(
        template: $template
        arguments: { projectId: $projectId, language: $language }
    ) {
        __typename
        text
        ...on QuickReplyPayload { buttons { title, type, ...on WebUrlButton { url } ...on PostbackButton { payload } } }
        ...on ImagePayload { image }
        ...on CustomPayload { buttons { title, type, ...on WebUrlButton { url } ...on PostbackButton { payload } }, elements, attachment, image, custom }
    }
}`;

export const CREATE_BOT_RESPONSE = gql`
mutation createResponse($projectId: String!, $response: BotResponseInput) {
    createResponse(projectId: $projectId, response: $response){
        success
    }
}`;

export const UPDATE_BOT_RESPONSE = gql`
mutation updateResponse($projectId: String!, $_id: String!, $response: BotResponseInput) {
    updateResponse(projectId: $projectId, _id: $_id, response: $response){
        success
    }
}`;
