import gql from 'graphql-tag';

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
