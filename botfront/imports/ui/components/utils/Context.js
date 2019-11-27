import React from 'react';

export const ConversationOptionsContext = React.createContext({
    storyGroups: [],
    deleteStoryGroup: () => {},
});
