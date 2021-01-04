import { searchStories, updateTestResults } from '../mongo/stories';

export default {
    Query: {
        dialogueSearch: async (_, args) => {
            const { projectId, language, queryString } = args;
            return searchStories(projectId, language, queryString);
        },
    },
    Mutation: {
        upsertTestResults: async(_, args) => {
            updateTestResults(args.results);
            return { success: true };
        },
    },
};
