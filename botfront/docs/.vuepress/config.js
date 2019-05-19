const version = require('../../package.json').version;

module.exports = {
    ga: 'UA-110157233-2',
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
        
        nav: [{ text: 'Guide', link: '/guide/getting-started/quick-start/' }, { text: 'Botfront website', link: 'https://botfront.io' }],

        sidebar: [
            {
                title: 'Getting Started', // required
                // path: '/guide',
                collapsable: false,
                sidebarDepth: 5,
                children: [
                    '/guide/getting-started/setup',
                    '/guide/getting-started/quick-start',
                    '/guide/getting-started/rasa-stack',
                    // '/guide/getting-started/advanced',
                ],
            },
            {
                title: 'Users Guide', // required
                // path: '/guide',
                collapsable: false,
                sidebarDepth: 5,
                children: ['/guide/users/settings', '/guide/users/endpoints', '/guide/users/credentials', '/guide/users/rules', '/guide/bot-responses/'],
            },
            {
                title: 'NLU Guide', // required
                // path: '/guide',
                collapsable: false,
                sidebarDepth: 5,
                children: [
                    '/guide/nlu/instances-models',
                    ['/guide/', 'Intents and Entities'],
                    '/guide/nlu/training_adding_data',
                    '/guide/nlu/training',
                    '/guide/nlu/evaluation',
                    '/guide/nlu/activity',
                ],
            },
            {
                title: 'Deployment Guide',   // required
                // path: '/guide',
                collapsable: false,
                sidebarDepth: 5,
                children: [
                    '/guide/deployment/',
                ]
            },
        ],
        serviceWorker: {
            updatePopup: true, // Boolean | Object, default to undefined.
            // If set to true, the default text config will be:
            // updatePopup: {
            //    message: "New content is available.",
            //    buttonText: "Refresh"
            // }
        },
    },
};
