import React from 'react';

export const ConversationOptionsContext = React.createContext({
    entities: [],
    intents: [],
    slots: [],
    language: 'en',
    insertResponse: () => {},
    updateResponse: () => {},
    deleteStoryGroup: () => {},
    getResponse: () => {},
    templates: [],
    storyGroups: [],
});
