import { getIntentStatistics } from '../mongo/statistics';
import { getModelIdsFromProjectId } from '../../../../lib/utils';

export default {
    Query: {
        getIntentStatistics: async (_root, args) => {
            // use context for auth?
            const { projectId, language } = args;
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
