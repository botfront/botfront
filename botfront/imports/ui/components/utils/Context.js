import React from 'react';

export const ConversationOptionsContext = React.createContext({
    entities: [],
    intents: [],
    slots: [],
    templates: [],
    storyGroups: [],
});
