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
query getResponse($template: StringOrListOfStrings!, $arguments: Any!) {
    getResponse(
        template: $template
        arguments: $arguments
    ) {
        __typename
        text
        ...on QuickReplyPayload { buttons { title, type, ...on WebUrlButton { url } ...on PostbackButton { payload } } }
        ...on ImagePayload { image }
        ...on CustomPayload { buttons { title, type, ...on WebUrlButton { url } ...on PostbackButton { payload } }, elements, attachment, image, custom }
    }
}`;

export const UPSERT_BOT_RESPONSE = gql`
mutation upsertResponse($projectId: String!, $key: String!, $language: String!, $newPayload: Any, $index: Int = -1) {
    upsertResponse(projectId: $projectId, key: $key, language: $language, newPayload: $newPayload, index: $index) {
        key
    }
}`;

export const UPSERT_BOT_RESPONSE_CACHE = variables => (cache, { data: { upsertResponse: updated } }) => {
    if (updated.key !== variables.key) return; // check if update returned key ie. was succesful
    const {
        projectId, key: template, language, newPayload,
    } = variables;
    cache.writeQuery({
        query: GET_BOT_RESPONSE,
        variables: { template, arguments: { projectId, language } },
        data: { getResponse: newPayload },
    });
};
