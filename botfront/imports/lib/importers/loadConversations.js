import { update } from './common';

export const addConversations = ({
    f, rawText, setFileList,
}) => {
    const conversations = JSON.parse(rawText);
   
    if (!Array.isArray(conversations) || conversations.length < 1) {
        return update(setFileList, f, { dataType: 'conversations', warnings: 'There are no conversations in this file' });
    }
    return update(setFileList, f, { dataType: 'conversations', rawText, conversations });
};
