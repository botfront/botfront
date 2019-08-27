import Conversations from './conversations.model';

export const getConversations = async (projectId, page, limit = 20) => Conversations.find(
    {
        projectId,
    },
    null,
    { skip: page * limit, limit },
);
