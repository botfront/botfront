/* global cy Cypress:true */

const addUserEvent = ({
    timestamp, text = 'no text', name = null, confidence = 0, language = 'en', userId,
}) => ([{
    event: 'user',
    timestamp,
    text,
    parse_data: {
        intent: { name, confidence },
        entities: [],
        language,
        intent_ranking: [],
        text,
    },
    input_channel: 'webchat',
    message_id: `${timestamp}-${text}-${name}`,
    metadata: { userId, language },
}]);

const addActionEvent = ({ timestamp, name = 'action_default' }) => ([{
    event: 'action',
    timestamp,
    name,
}]);

const addBotEvent = ({ timestamp, text, name = 'utter_no_name' }) => ([
    {
        event: 'action',
        timestamp,
        name,
    },
    {
        event: 'bot',
        timestamp,
        text: text || name,
        data: {
            elements: null,
            quick_replies: null,
            buttons: null,
            attachment: null,
            image: null,
            custom: null,
        },
        metadata: {},
    },
]);

Cypress.Commands.add('addCustomConversation', (
    projectId,
    conversationId,
    {
        events, duration = 1, startTime = new Date().getTime() / 1000, senderId = conversationId, env, language,
    },
) => {
    /*
        events:
            type: 'user' || 'bot' || 'action
            name: String. sets the name field for action, user, and bot events
            text: String. sets the text for a user or bot event
            confidence: Number between 0 and 1 inclusive. sets the confidence field on user events
            language: String. 'en', 'fr', etc. sets the language for a user event
            userId: String. the userId for the userId filter on the conversations page
    */
    const endTime = startTime + duration;
    const trackerEvents = events.reduce((currentEvents, { type, ...data }, i) => {
        const timestamp = i === events.length - 1 ? endTime : startTime;
        if (type === 'user') {
            return [...currentEvents, ...addUserEvent({ ...data, timestamp, language })];
        }
        if (type === 'bot') {
            return [...currentEvents, ...addBotEvent({ ...data, timestamp })];
        }
        if (type === 'action') {
            return [...currentEvents, ...addActionEvent({ ...data, timestamp })];
        }
        return currentEvents;
    }, []);

    const conversation = {
        sender_id: senderId,
        slots: {
            disambiguation_message: null,
        },
        latest_message: {
            intent: {},
            entities: [],
            text: null,
            message_id: null,
            metadata: { language },
        },
        latest_event_time: endTime,
        followup_action: null,
        paused: false,
        events: [...addActionEvent({ name: 'action_listen', timestamp: startTime })],
        latest_input_channel: 'webchat',
        active_form: {},
        latest_action_name: 'action_listen',
    };
    const conversationB = {
        ...conversation,
        events: trackerEvents,
    };
    cy.addConversation(projectId, conversationId, conversation, env);
    cy.updateConversation(projectId, conversationId, conversationB, env);
});

Cypress.Commands.add('addConversationFromTemplate', (projectId = 'bf', template = 'default', conversationId, options = {}) => {
    const {
        duration, startTime, env, language,
    } = options;
    cy.fixture('conversation_event_templates.json', 'utf8').then((templates) => {
        cy.addCustomConversation(
            projectId,
            conversationId,
            {
                events: templates[template],
                duration,
                startTime,
                env,
                language,
            },
        );
    });
});
