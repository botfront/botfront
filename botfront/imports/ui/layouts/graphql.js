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
        ...on QuickReplyPayload { text, buttons { title, type, ...on WebUrlButton { url }, ...on PostbackButton { payload } } }
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
mutation upsertResponse($projectId: String!, $key: String!, $language: String!, $newPayload: Any, $index: Int = -1) {
    upsertResponse(projectId: $projectId, key: $key, language: $language, newPayload: $newPayload, index: $index) {
        key
    }
}`;
