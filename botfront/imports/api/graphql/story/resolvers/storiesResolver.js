import { searchStories } from '../mongo/stories';

export default {
    Query: {
        storiesSearch: async (_, args) => {
            const { projectId, language, queryString } = args;
            return searchStories(projectId, language, queryString);
        },
    },
};
