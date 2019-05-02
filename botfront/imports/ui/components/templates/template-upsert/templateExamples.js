export const examples = [
    { text: 'simple text message' },
    {
        text: 'text above the buttons',
        buttons: [{ title: 'Button title 1', payload: '/payload1' }, { title: 'Button title 2', payload: '/payload2' }],
    },
    {
        text: 'optional text above image (replace by "" to leave blank)',
        image: 'http://url.to.image',
    },
    {
        template_type: 'button',
        text: 'your text',
        buttons: [{ title: 'Button title 1', type: 'postback', payload: '/payload1' }, { title: 'Button title 2', type: 'web_url', url: 'http://...' }],
    },
    {
        template_type: 'generic',
        elements: [
            {
                title: 'Title of carousel block 1',
                buttons: [{ title: 'Button title 1', type: 'postback', payload: '/payload1' }, { title: 'Button title 2', type: 'web_url', url: 'http://...' }],
            },
            {
                title: 'Title of carousel block 2',
                buttons: [{ title: 'Button title 1', type: 'postback', payload: '/payload1' }, { title: 'Button title 2', type: 'web_url', url: 'http://...' }],
            },
        ],
    },
    {
        template_type: 'list',
        top_element_style: 'compact',
        elements: [
            {
                title: 'Title of list block 1',
                buttons: [{ title: 'Button title 1', type: 'postback', payload: '/payload1' }, { title: 'Button title 2', type: 'web_url', url: 'http://...' }],
            },
            {
                title: 'Title of list block 2',
                buttons: [{ title: 'Button title 1', type: 'postback', payload: '/payload1' }, { title: 'Button title 2', type: 'web_url', url: 'http://...' }],
            },
        ],
    },

    {
        template_type: 'handoff',
        expire_after: 120,
    },
    // {
    //     elements: [
    //         {
    //             title: 'Title of carousel block 1',
    //             buttons: [
    //                 { title: 'Button title 1', payload: '/payload1' },
    //                 { title: 'Button title 2', payload: '/payload2' },
    //             ],
    //         },
    //         {
    //             title: 'Title of carousel block 2',
    //             buttons: [
    //                 { title: 'Button title 1', payload: '/payload1' },
    //                 { title: 'Button title 2', payload: '/payload2' },
    //             ],
    //         },
    //     ],
    // },
];
