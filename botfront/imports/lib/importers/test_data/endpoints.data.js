export const validEndpoints = {
    filename: 'endpointstest.yml',
    rawText:
    `nlg:
    type: rasa_addons.core.nlg.GraphQLNaturalLanguageGenerator
    url: 'http://host.docker.internal:3000/graphql'
action_endpoint:
    url: 'http://host.docker.internal:5055/webhook'
tracker_store:
    store_type: rasa_addons.core.tracker_stores.botfront.BotfrontTrackerStore
    url: 'http://host.docker.internal:3000/graphql'`,
    dataType: 'endpoints',
};

export const validEndpointsParsed = {
    action_endpoint: {
        url: 'http://host.docker.internal:5055/webhook',
    },
    nlg: {
        type: 'rasa_addons.core.nlg.GraphQLNaturalLanguageGenerator',
        url: 'http://host.docker.internal:3000/graphql',
    },
    tracker_store: {
        store_type: 'rasa_addons.core.tracker_stores.botfront.BotfrontTrackerStore',
        url: 'http://host.docker.internal:3000/graphql',
    },
};
