const version = require('../../package.json').version;


module.exports = {
    base: '/',
    permalink: ':slug',
    plugins: [
            ['@vuepress/google-analytics', {
                ga: 'UA-110157233-3'
            }],
            // '@vuepress/plugin-pwa',
            '@vuepress/active-header-links',
            '@vuepress/plugin-medium-zoom',
            '@vuepress/back-to-top',
            'vuepress-plugin-element-tabs',
        ],
    title: 'Documentation',
    themeConfig: {
        algolia: {
            apiKey: '8b60ee4c0486b30ef1cd92220831bc34',
            indexName: 'botfront'
        },
        docsRepo: 'botfront/botfront',
        docsDir: 'botfront/docs',
        docsBranch: 'master',
        editLinks: true,
        editLinkText: '🖊️ Edit this page on Github!',
        lastUpdated: 'Last Updated',

        nav: [
            { text: 'Guide', link: '/guide/getting-started/setup' },
            { text: 'Get help', link: 'https://spectrum.chat/botfront' },
            { text: 'Github', link: 'https://github.com/botfront/botfront' },
            { text: 'Botfront.io', link: 'https://botfront.io' },
        ],

        sidebar: [
            {
                title: 'Getting started', // required
                // path: '/guide',
                collapsable: false,
                sidebarDepth: 5,
                children: [
                    '/guide/getting-started/setup',
                    '/guide/getting-started/quick-start',
                    '/guide/getting-started/import-export',
                    '/guide/getting-started/cli',
                ],
            },
            {
                title: 'Dialogue', // required
                // path: '/guide',
                collapsable: false,
                sidebarDepth: 5,
                children: [
                    '/guide/rasa/stories/conversation_builder',
                    '/guide/rasa/stories/conversation_flows',
                    '/guide/rasa/stories/disambiguation',
                    '/guide/rasa/stories/optimization',
                ],
            },
            {
                title: 'NLU', // required
                // path: '/guide',
                collapsable: false,
                sidebarDepth: 5,
                children: [
                    ['/guide/rasa/nlu/', 'Intents and Entities'],
                    '/guide/rasa/nlu/training_adding_data',
                    '/guide/rasa/nlu/training',
                    '/guide/rasa/nlu/evaluation',
                ],
            },
            {
                title: 'Development',   // required
                // path: '/guide',
                collapsable: false,
                sidebarDepth: 5,
                children: [
                    '/guide/developers-guide/custom_actions',
                    '/guide/developers-guide/extending-rasa',
                    '/guide/developers-guide/contributing',
                ]
            },
            {
                title: 'Deployment',   // required
                // path: '/guide',
                collapsable: false,
                sidebarDepth: 1,
                children: [
                    '/guide/deployment/installation',
                ]
            },
            {
                title: 'Channels',   // required
                // path: '/guide',
                collapsable: false,
                sidebarDepth: 0,
                children: [
                    ['/guide/channels/overview', 'Overview'],
                    '/guide/channels/webchat',
                    '/guide/channels/messenger',
                ]
            },
            {
                title: 'Misc',   // required
                // path: '/guide',
                collapsable: false,
                sidebarDepth: 5,
                children: [
                    '/guide/misc/migration',
                ]
            },
        ],
    },
};
