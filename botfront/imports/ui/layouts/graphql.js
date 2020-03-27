import gql from 'graphql-tag';

const botResponseFields = gql`
    fragment BotResponseFields on BotResponsePayload {
        __typename
        text
        metadata
        ...on QuickReplyPayload { buttons { title, type, ...on WebUrlButton { url } ...on PostbackButton { payload } } }
        ...on ImagePayload { image }
        ...on CustomPayload { buttons { title, type, ...on WebUrlButton { url } ...on PostbackButton { payload } }, elements, attachment, image, custom }
    }
`;

export const GET_BOT_RESPONSES = gql`
    query getResponses($templates: [String]!, $language: String!, $projectId: String!) {
        getResponses(projectId: $projectId, language: $language, templates: $templates) {
            key
            ...BotResponseFields
        }
    }
    ${botResponseFields}
`;

export const UPSERT_BOT_RESPONSE = gql`
mutation upsertResponse($projectId: String!, $key: String!, $language: String!, $newPayload: Any, $index: Int = -1, $logging: Boolean = true) {
    upsertResponse(projectId: $projectId, key: $key, language: $language, newPayload: $newPayload, index: $index, logging: $logging) {
        key
    }
}`;
