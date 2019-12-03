import React from 'react';

export const ProjectContext = React.createContext({
    entities: [],
    intents: [],
    slots: [],
    insertResponse: () => {},
    updateResponse: () => {},
    getResponse: () => {},
    templates: [],
    storyGroups: [],
    intentsWithCanonicals: [],
});
