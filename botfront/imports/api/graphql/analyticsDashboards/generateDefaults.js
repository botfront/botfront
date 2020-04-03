import moment from 'moment';

export const defaultDashboard = (project) => {
    const startDate = moment().subtract(6, 'days').startOf('day').toISOString();
    const endDate = moment().endOf('day').toISOString();
    const { _id: projectId, defaultLanguage } = project;
    return ({
        name: 'Default Dashboard',
        projectId,
        languages: [defaultLanguage],
        envs: ['development'],
        cards: [
            {
                name: 'Visits & Engagement',
                type: 'visitCounts',
                visible: true,
                startDate,
                endDate,
                chartType: 'line',
                valueType: 'absolute',
                wide: true,
            },
            {
                name: 'Conversation Length',
                type: 'conversationLengths',
                visible: true,
                startDate,
                endDate,
                chartType: 'bar',
                valueType: 'absolute',
            },
            {
                name: 'Top 10 Intents',
                type: 'intentFrequencies',
                visible: true,
                startDate,
                endDate,
                chartType: 'bar',
                valueType: 'absolute',
                exclude: ['get_started'],
            },
            {
                name: 'Conversation Duration',
                type: 'conversationDurations',
                visible: true,
                startDate,
                endDate,
                chartType: 'bar',
                valueType: 'absolute',
            },
            {
                name: 'Conversations with Fallback',
                type: 'conversationsWithFallback',
                visible: true,
                startDate,
                endDate,
                chartType: 'line',
                valueType: 'absolute',
                include: ['action_botfront_fallback'],
            },
            {
                name: 'Fallback Rate',
                type: 'fallbackCounts',
                visible: true,
                startDate,
                endDate,
                chartType: 'line',
                valueType: 'absolute',
                include: ['action_botfront_fallback'],
            },
        ],
    });
};
