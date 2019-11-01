import Conversations from '../conversations.model.js'

export const getConversations = async (projectId, page, limit = 20) => Conversations.find(
    {
        projectId,
    }).lean();
