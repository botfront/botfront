export const storyGroupOne = [
    `## Farewells
> checkpoint_1
> checkpoint_0

> checkpoint_2`,
    `## Get started
* get_started
  - utter_get_started
> Get_started__branches`,
    `## Get started__New Branch 1
> Get_started__branches`,
    `## Get started__New Branch 2
<!-- hey this one is a multiline
        comment  -->
> Get_started__branches

> Get_started__New_Branch_2__branches`,
    `## Get started__New Branch 2__New Branch 1
> Get_started__New_Branch_2__branches

> checkpoint_1`,
    `## Get started__New Branch 2__New Branch 2
> Get_started__New_Branch_2__branches

> checkpoint_0`,
];

export const storyGroupTwo = [
    `## Greetings
> checkpoint_2
* chitchat.greet
  - utter_hi`,
];

export const storyGroupThree = [
    `>> Rule one
- utter_get_started
- ...
  * intent_1
- utter_get_started`,
    `>> Rule two
* get_started
  - utter_get_started`,
    `## Story One
- utter_get_started
  * intent_1`,
    `>> Branched_rule
- ...
> Branched_rule__branches`,
    `>> Branched_rule__branch1
> Branched_rule__branches`,
    `>> Branched_rule__branch2
> Branched_rule__branches`,
];

export const badStories = [
    `## Sandwich
* intent_1
> checkpoint_1
* intent_2`,
    `## Mismatched mother__child
> Another_mothers__branches
* intent_1`,
    `## Mother__child
> Mother__branches
> Mother__branches
* intent_1`,
    `## Multiple destinations
* intent_1
> one
> two`,
    `## Mismatched child
* intent_1
> Another_names__branches`,
];

export const storyGroups = [
    { name: 'storyGroupOne', rawText: storyGroupOne.join('\n'), _id: '123' },
    { name: 'storyGroupTwo', rawText: storyGroupTwo.join('\n'), _id: '456' },
];

export const storyGroupOneParsed = [
    {
        storyGroupId: '123',
        title: 'Farewells',
        fullTitle: 'Farewells',
        ancestorOf: [],
        linkFrom: ['checkpoint_1', 'checkpoint_0'],
        hasDescendents: false,
        linkTo: 'checkpoint_2',
        body: '',
        type: 'story',
    },
    {
        storyGroupId: '123',
        title: 'Get started',
        fullTitle: 'Get started',
        ancestorOf: [],
        linkFrom: [],
        hasDescendents: true,
        linkTo: null,
        body: '* get_started\n  - utter_get_started',
        type: 'story',
    },
    {
        storyGroupId: '123',
        title: 'New Branch 1',
        fullTitle: 'Get started__New Branch 1',
        ancestorOf: ['Get_started'],
        linkFrom: [],
        hasDescendents: false,
        linkTo: null,
        body: '',
    },
    {
        storyGroupId: '123',
        title: 'New Branch 2',
        fullTitle: 'Get started__New Branch 2',
        ancestorOf: ['Get_started'],
        linkFrom: [],
        hasDescendents: true,
        linkTo: null,
        body: '',
    },
    {
        storyGroupId: '123',
        title: 'New Branch 1',
        fullTitle: 'Get started__New Branch 2__New Branch 1',
        ancestorOf: ['Get_started', 'New_Branch_2'],
        linkFrom: [],
        hasDescendents: false,
        linkTo: 'checkpoint_1',
        body: '',
    },
    {
        storyGroupId: '123',
        title: 'New Branch 2',
        fullTitle: 'Get started__New Branch 2__New Branch 2',
        ancestorOf: ['Get_started', 'New_Branch_2'],
        linkFrom: [],
        hasDescendents: false,
        linkTo: 'checkpoint_0',
        body: '',
    },
];

export const storyGroupThreeParsed = [
    {
        storyGroupId: '789',
        title: 'Rule one',
        fullTitle: 'Rule one',
        ancestorOf: [],
        linkFrom: [],
        hasDescendents: false,
        linkTo: null,
        body: '- utter_get_started\n- ...\n  * intent_1\n- utter_get_started',
        type: 'rule',
    },
    {
        storyGroupId: '789',
        title: 'Rule two',
        fullTitle: 'Rule two',
        ancestorOf: [],
        linkFrom: [],
        hasDescendents: false,
        linkTo: null,
        body: '* get_started\n  - utter_get_started',
        type: 'rule',
    },
    {
        storyGroupId: '789',
        title: 'Story One',
        fullTitle: 'Story One',
        ancestorOf: [],
        linkFrom: [],
        hasDescendents: false,
        linkTo: null,
        body: '- utter_get_started\n  * intent_1',
        type: 'story',
    },
    {
        storyGroupId: '789',
        title: 'Branched_rule',
        fullTitle: 'Branched_rule',
        ancestorOf: [],
        linkFrom: [],
        hasDescendents: true,
        linkTo: null,
        body: '- ...',
        type: 'rule',
    },
    {
        storyGroupId: '789',
        title: 'branch1',
        fullTitle: 'Branched_rule__branch1',
        ancestorOf: ['Branched_rule'],
        linkFrom: [],
        hasDescendents: false,
        linkTo: null,
        body: '',
    },
    {
        storyGroupId: '789',
        title: 'branch2',
        fullTitle: 'Branched_rule__branch2',
        ancestorOf: ['Branched_rule'],
        linkFrom: [],
        hasDescendents: false,
        linkTo: null,
        body: '',
    },
];

export const storyGroupTwoParsed = [
    {
        storyGroupId: '456',
        title: 'Greetings',
        fullTitle: 'Greetings',
        ancestorOf: [],
        linkFrom: ['checkpoint_2'],
        hasDescendents: false,
        linkTo: null,
        body: '* chitchat.greet\n  - utter_hi',
        type: 'story',
    },
];
export const storiesGeneratedWithRule = [{
    story: '- utter_get_started\n- ...\n  * intent_1\n- utter_get_started',
    title: 'Rule one',
    type: 'rule',
    storyGroupId: '789',
    branches: [],
}, {
    story: '* get_started\n  - utter_get_started',
    title: 'Rule two',
    type: 'rule',
    storyGroupId: '789',
    branches: [],
}, {
    story: '- utter_get_started\n  * intent_1',
    title: 'Story One',
    type: 'story',
    storyGroupId: '789',
    branches: [],
}, {
    story: '- ...',
    title: 'Branched_rule',
    type: 'rule',
    storyGroupId: '789',
    branches: [{
        story: '', title: 'branch1', branches: [],
    }, {
        story: '', title: 'branch2', branches: [],
    }],
}];
export const storiesGenerated = [
    {
        story: '',
        title: 'Farewells',
        storyGroupId: '123',
        branches: [],
        type: 'story',
    },
    {
        story: '* get_started\n  - utter_get_started',
        title: 'Get started',
        type: 'story',
        storyGroupId: '123',
        branches: [
            { story: '', title: 'New Branch 1', branches: [] },
            {
                story: '',
                title: 'New Branch 2',
                branches: [
                    { story: '', title: 'New Branch 1', branches: [] },
                    { story: '', title: 'New Branch 2', branches: [] },
                ],
            },
        ],
    },
    {
        story: '* chitchat.greet\n  - utter_hi',
        title: 'Greetings',
        storyGroupId: '456',
        branches: [],
        type: 'story',
    },
];
