import { searchStories } from '../mongo/stories';

export default {
    Query: {
        dialogueSearch: async (_, args) => {
            const { projectId, language, queryString } = args;
            return searchStories(projectId, language, queryString);
        },
    },
};
