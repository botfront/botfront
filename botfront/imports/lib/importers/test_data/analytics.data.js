export const validAnalytics = {
    filename: 'analyticsconfig.yml',
    rawText:
    `_id: 5fc56626e719a12ab32a51fe
cards:
  - name: Visits & Engagement
    description: >-
        Visits: the total number of conversations in a given temporal window.
        Engagements: of those conversations, those with length one or more.
    type: conversationCounts
    visible: true
    startDate: '2020-11-24T05:00:00.000Z'
    endDate: '2020-12-01T04:59:59.999Z'
    chartType: line
    valueType: absolute
    includeIntents: null
    excludeIntents: null
    includeActions: null
    excludeActions: null
    conversationLength: 1
    userInitiatedConversations: true
    triggerConversations: true
    selectedSequence: null
    wide: true
    showDenominator: true
    limit: null
    eventFilter: []
    eventFilterOperator: or
    __typename: AnalyticsCard
languages:
    - en
envs:
    - development
name: Default Dashboard
__v: 0
    `,
    dataType: 'analytics',
};

export const validAnalyticsParsed = {
    languages: [
        'en',
    ],
    cards: [
        {
            startDate: '2020-11-24T05:00:00.000Z',
            endDate: '2020-12-01T04:59:59.999Z',
            description: 'Visits: the total number of conversations in a given temporal window. Engagements: of those conversations, those with length one or more.',
            name: 'Visits & Engagement',
            triggerConversations: true,
            valueType: 'absolute',
            includeActions: null,
            selectedSequence: null,
            excludeIntents: null,
            eventFilterOperator: 'or',
            visible: true,
            chartType: 'line',
            includeIntents: null,
            excludeActions: null,
            wide: true,
            eventFilter: [],
            __typename: 'AnalyticsCard',
            userInitiatedConversations: true,
            conversationLength: 1,
            limit: null,
            showDenominator: true,
            type: 'conversationCounts',
        },
    ],
    __v: 0,
    name: 'Default Dashboard',
    envs: [
        'development',
    ],
    _id: '5fc56626e719a12ab32a51fe',
      
};
