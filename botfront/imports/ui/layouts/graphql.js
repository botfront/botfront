import gql from 'graphql-tag';

const botResponseFields = gql`
    fragment CarouselElementFields on CarouselElement {
        title
        subtitle
        image_url
        default_action { title, type, ...on WebUrlButton { url }, ...on PostbackButton { payload } }
        buttons { title, type, ...on WebUrlButton { url }, ...on PostbackButton { payload } }
    }
    fragment BotResponseFields on BotResponsePayload {
        __typename
        metadata
        ...on TextPayload { text }
        ...on QuickRepliesPayload { text, quick_replies { title, type, ...on WebUrlButton { url }, ...on PostbackButton { payload } } }
        ...on TextWithButtonsPayload { text, buttons { title, type, ...on WebUrlButton { url }, ...on PostbackButton { payload } } }
        ...on ImagePayload { text, image }
        ...on CarouselPayload { template_type, elements { ...CarouselElementFields } }
        ...on CustomPayload { customText: text, customImage: image, customButtons: buttons, customElements: elements, custom, customAttachment: attachment }
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
mutation upsertResponse($projectId: String!, $key: String!, $newKey: String, $language: String!, $newPayload: Any, $index: Int = -1, $logging: Boolean = true, $newResponseType: String) {
    upsertResponse(projectId: $projectId, key: $key, newKey: $newKey, language: $language, newPayload: $newPayload, index: $index, logging: $logging, newResponseType: $newResponseType) {
        key
    }
}`;
