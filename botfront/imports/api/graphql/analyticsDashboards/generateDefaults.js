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
                type: 'conversationsWithIntent',
                visible: true,
                startDate,
                endDate,
                chartType: 'line',
                valueType: 'absolute',
                excludeIntents: ['get_started'],
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
                excludeIntents: ['get_started'],
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
                type: 'conversationsWithAction',
                visible: true,
                startDate,
                endDate,
                chartType: 'line',
                valueType: 'absolute',
                includeActions: ['action_botfront_fallback'],
            },
            {
                name: 'Fallback Rate',
                type: 'actionCounts',
                visible: true,
                startDate,
                endDate,
                chartType: 'line',
                valueType: 'absolute',
                includeActions: ['action_botfront_fallback'],
            },
        ],
    });
};
