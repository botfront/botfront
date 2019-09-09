import React from 'react';

export const ConversationOptionsContext = React.createContext({
    entities: [],
    intents: [],
    slots: [],
});

export const ResponsesContext = React.createContext({
    templates: [],
});
