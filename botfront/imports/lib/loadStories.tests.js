import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { parseStoryGroup } from './loadStories';

const storyGroupOne = [
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
    `## Greetings
> checkpoint_2
* chitchat.greet
  - utter_hi`,
].join('\n');

const storyGroupOneParsed = [{
    storyGroupName: 'storyGroupOne',
    title: 'Farewells',
    fullTitle: 'Farewells',
    ancestorOf: [],
    linkFrom: ['checkpoint_1', 'checkpoint_0'],
    hasDescendents: false,
    linkTo: 'checkpoint_2',
    body: '',
},
{
    storyGroupName: 'storyGroupOne',
    title: 'Get started',
    fullTitle: 'Get started',
    ancestorOf: [],
    linkFrom: [],
    hasDescendents: true,
    linkTo: null,
    body: '* get_started\n  - utter_get_started',
},
{
    storyGroupName: 'storyGroupOne',
    title: 'New Branch 1',
    fullTitle: 'Get started__New Branch 1',
    ancestorOf: ['Get_started'],
    linkFrom: [],
    hasDescendents: false,
    linkTo: null,
    body: '',
},
{
    storyGroupName: 'storyGroupOne',
    title: 'New Branch 2',
    fullTitle: 'Get started__New Branch 2',
    ancestorOf: ['Get_started'],
    linkFrom: [],
    hasDescendents: true,
    linkTo: null,
    body: '',
},
{
    storyGroupName: 'storyGroupOne',
    title: 'New Branch 1',
    fullTitle: 'Get started__New Branch 2__New Branch 1',
    ancestorOf: ['Get_started', 'New_Branch_2'],
    linkFrom: [],
    hasDescendents: false,
    linkTo: 'checkpoint_1',
    body: '',
},
{
    storyGroupName: 'storyGroupOne',
    title: 'New Branch 2',
    fullTitle: 'Get started__New Branch 2__New Branch 2',
    ancestorOf: ['Get_started', 'New_Branch_2'],
    linkFrom: [],
    hasDescendents: false,
    linkTo: 'checkpoint_0',
    body: '',
},
{
    storyGroupName: 'storyGroupOne',
    title: 'Greetings',
    fullTitle: 'Greetings',
    ancestorOf: [],
    linkFrom: ['checkpoint_2'],
    hasDescendents: false,
    linkTo: null,
    body: '* chitchat.greet\n  - utter_hi',
}];

if (Meteor.isServer) {
    describe('loadStories', function() {
        it('required temporary features are extracted from raw story md', function() {
            expect(parseStoryGroup('storyGroupOne', storyGroupOne)).to.be.deep.equal(storyGroupOneParsed);
        });
    });
}
