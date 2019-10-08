const version = require('../../package.json').version;


module.exports = {
    permalink: ':slug',
    plugins: [
            ['@vuepress/google-analytics', {
                ga: 'UA-110157233-2'
            }],
            // '@vuepress/plugin-pwa',
            '@vuepress/active-header-links',
            '@vuepress/plugin-medium-zoom',
            '@vuepress/back-to-top'
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
                    '/guide/getting-started/cli',
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
                title: 'Dialogue', // required
                // path: '/guide',
                collapsable: false,
                sidebarDepth: 5,
                children: [
                    '/guide/rasa/stories/',
                    '/guide/rasa/stories/custom_actions',
                ],
            },
            {
                title: 'Deployment',   // required
                // path: '/guide',
                collapsable: false,
                sidebarDepth: 5,
                children: [
                    '/guide/deployment/installation',
                    '/guide/deployment/frontend',
                ]
            },
            {
                title: 'Developer\'s Guide',   // required
                // path: '/guide',
                collapsable: false,
                sidebarDepth: 5,
                children: [
                    '/guide/developers-guide/',
                ]
            },
        ],
    },
};
