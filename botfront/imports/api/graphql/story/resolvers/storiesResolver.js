import { searchStories } from '../mongo/stories';
import { checkIfCan } from '../../../../lib/scopes';

export default {
    Query: {
        dialogueSearch: async (_, args, context) => {
            checkIfCan('stories:r', args.projectId, context.user._id);
            const { projectId, language, queryString } = args;
            return searchStories(projectId, language, queryString);
        },
    },
};
