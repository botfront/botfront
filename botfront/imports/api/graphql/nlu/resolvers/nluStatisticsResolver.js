import { getIntentStatistics } from '../mongo/statistics';
import { getModelIdsFromProjectId } from '../../../../lib/utils';
import { checkIfCan } from '../../../roles/roles';

export default {
    Query: {
        getIntentStatistics: async (_root, args, context) => {
            const { projectId, language } = args;
            checkIfCan('nlu-data:r', projectId, context.user._id);
            const ids = await getModelIdsFromProjectId(projectId);
            const stats = await getIntentStatistics(ids);
            return stats.map(({ intent, languages }) => ({
                intent,
                example: (languages.filter(l => l.language === language)[0] || {}).example || null,
                counts: languages.map(({ example, ...rest }) => rest),
            }));
        },
    },

    NluStatistics: {
        intent: ({ intent }) => intent,
        example: ({ example }) => example,
        counts: ({ counts }) => counts,
    },

    NluStatisticsByLanguage: {
        language: ({ language }) => language,
        count: ({ count }) => count,
    },
};
