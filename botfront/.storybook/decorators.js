import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { ProjectContext } from '../imports/ui/layouts/context';
import { ConversationOptionsContext } from '../imports/ui/components/stories/Context';
import store from '../imports/ui/store/store';
import { OOS_LABEL } from '../imports/ui/components/constants.json';

export const slots = [
    { name: 'textSlot1', type: 'text' }, { name: 'textSlot2', type: 'text' }, { name: 'textSlot3', type: 'text' },
    { name: 'catSlot1', type: 'categorical', categories: ['c1'] }, { name: 'catSlot2', type: 'categorical', categories: ['c2'] }, { name: 'catSlot3', type: 'categorical', categories: ['c3'] },
    { name: 'listSlot1', type: 'list' }, { name: 'listSlot2', type: 'list' }, { name: 'listSlot3', type: 'list' },
    { name: 'boolSlot1', type: 'bool' }, { name: 'boolSlot2', type: 'bool' }, { name: 'boolSlot3', type: 'bool' },
];

const intentsFixture = ['intent1', 'intent2', 'intent3', 'intent4'];
const entitiesFixture = ['entity1', 'entity2', 'entity3', 'entity4'];

const utteranceOne = {
    canonical: true,
    intent: 'I_come_from',
    entities: [
        {
            start: 12,
            end: 17,
            value: 'Paris',
            entity: 'from',
        },
    ],
    text: `I come from Paris. Lorem ipsum dolor sit amet, consectetur adipiscing elit,
sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
};

const utteranceTwo = {
    canonical: true,
    intent: 'I_want_peanuts_on_my_sundae',
    entities: [
        {
            start: 7,
            end: 14,
            value: 'peanuts',
            entity: 'food',
        },
        {
            start: 43,
            end: 50,
            value: 'peanuts',
            entity: 'food',
        },
    ],
    text: 'I love peanuts all night long. Do you love peanuts as much as me? Ok ?',
};

const utteranceThree = {
    canonical: true,
    intent: 'Im_summarizing_Moby_Dick',
    entities: [],
    text: `On the first day of the chase, Ahab smells the whale, climbs the mast, and sights Moby Dick. He claims the doubloon for himself, and orders all
boats to lower except for Starbuck's. The whale bites Ahab's boat in two, tosses the captain out of it, and scatters the crew. On the second day of the chase,
Ahab leaves Starbuck in charge of the Pequod. Moby Dick smashes the three boats that seek him into splinters and tangles their lines. Ahab is rescued, but his ivory leg and Fedallah are lost.
Starbuck begs Ahab to desist, but Ahab vows to slay the white whale, even if he would have to dive through the globe itself to get his revenge.`,
};

const responseFixtures = { 
    utter_yay: {
        __typename: 'TextPayload',
        text: 'YAY!!\n\nBOO!\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut\n                  labore et dolore magna aliqua.',
    },
    utter_boo: {
        __typename: 'TextPayload',
        text: 'I love peanutes too\n\nCan I call u l8r?'
    }
}
const utteranceFixtures = { utteranceOne, utteranceTwo, utteranceThree };

const getCanonicalExamples = ({ intent, entities }) => ([
    { intent: 'YAY', text: 'HUHUHU HUHUHUUH UUHUUH AHUAHS', entities: [] },
    { intent: 'YAY2', text: 'HAHAHA', entities: [] },
    { intent: 'YAY3', text: 'HAHAHA', entities: [] },
    { intent: 'YAY4', text: 'HAHAHA', entities: [] },
    { intent: 'YAY5', text: 'HAHAHA', entities: [] },
    { intent: 'YAY6', text: 'HAHAHA', entities: [] },
    { intent: 'YAY7', text: 'HAHAHA', entities: [] },
    { intent: 'YAY8', text: 'HAHAHA', entities: [] },
    { intent: 'YAY9', text: 'HAHAHA', entities: [] },
    { intent: 'YAY10', text: 'HAHAHA', entities: [] },
    { intent: 'YAY11', text: 'HAHAHA', entities: [] },
    { intent: 'YAY12', text: 'HAHAHA', entities: [] },
    { intent: 'YAY13', text: 'HAHAHA', entities: [] },
    { intent: 'YAY14', text: 'HAHAHA', entities: [] },
    { intent: 'YAY15', text: 'HAHAHA', entities: [] },
    { intent: 'YAY16', text: 'HAHAHA', entities: [] },
    { intent: 'YAY17', text: 'HAHAHA', entities: [] },
]);

const parseUtterance = u => ({
    intent: OOS_LABEL,
    text: u,
});

export const withProjectContext = (story) => {
    const [responses, updateResponses] = useState(responseFixtures);
    const [entities, setEntities] = useState(entitiesFixture);
    const [intents, setIntents] = useState(intentsFixture);
    const [utterances, updateUtterances] = useState(utteranceFixtures)

    const addEntity = entity => setEntities(Array.from(new Set([...entities, entity])));
    const addIntent = intent => setIntents(Array.from(new Set([...intents, intent])));
    const getUtteranceFromPayload = (payload, callback) => {
        callback(
            null,
            [
                ...Object.values(utterances).filter(u => u.intent === payload.intent),
                { ...payload, text: 'not found' },
            ][0],
        );
    };

    return (
        <ProjectContext.Provider
            value={{
                project: { _id: 'bf', storyGroups: ['0', '1', '2', '3', '4', '5', '6'] },
                slots,
                intents,
                entities,
                responses,
                parseUtterance,
                addUtterancesToTrainingData: (content, callback) => {
                    updateUtterances(
                        content.reduce((acc, curr) => ({ ...acc, [curr.text]: curr }), utterances),
                    );
                    callback();
                },
                upsertResponse: (title, content) => new Promise((resolve) => {
                    updateResponses({ ...responses, [title]: content });
                    return resolve({ ...responses, [title]: content })
                }),
                addEntity,
                addIntent,
                getUtteranceFromPayload,
                updateResponses,
                projectLanguages: [
                    { text: 'English', value: 'en' },
                    { text: 'Tibetan Standard, Tibetan, Central', value: 'bo' },
                    { text: 'Divehi, Dhivehi, Maldivian', value: 'dv' },
                ],
                language: 'en',
                getCanonicalExamples,
            }}
        >
            {story()}
        </ProjectContext.Provider>
    );
};

export const withStoriesContext = (story) => (
    <ConversationOptionsContext.Provider
        value={{ storyGroups: [] }}
    >
        {story()}
    </ConversationOptionsContext.Provider>
);

export const withReduxProvider = (story) => (
    <Provider store={store}>
        {story()}
    </Provider>
);

export const withBackground = (story) => (
    <div
    style={{
        height: 'auto',
        minHeight: '100vh',
        padding: '15px',
        backgroundColor: '#666',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 200 200\'%3E%3Cdefs%3E%3ClinearGradient id=\'a\' gradientUnits=\'userSpaceOnUse\' x1=\'100\' y1=\'33\' x2=\'100\' y2=\'-3\'%3E%3Cstop offset=\'0\' stop-color=\'%23000\' stop-opacity=\'0\'/%3E%3Cstop offset=\'1\' stop-color=\'%23000\' stop-opacity=\'1\'/%3E%3C/linearGradient%3E%3ClinearGradient id=\'b\' gradientUnits=\'userSpaceOnUse\' x1=\'100\' y1=\'135\' x2=\'100\' y2=\'97\'%3E%3Cstop offset=\'0\' stop-color=\'%23000\' stop-opacity=\'0\'/%3E%3Cstop offset=\'1\' stop-color=\'%23000\' stop-opacity=\'1\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill=\'%23ca481d\' fill-opacity=\'0.6\'%3E%3Crect x=\'100\' width=\'100\' height=\'100\'/%3E%3Crect y=\'100\' width=\'100\' height=\'100\'/%3E%3C/g%3E%3Cg fill-opacity=\'0.5\'%3E%3Cpolygon fill=\'url(%23a)\' points=\'100 30 0 0 200 0\'/%3E%3Cpolygon fill=\'url(%23b)\' points=\'100 100 0 130 0 100 200 100 200 130\'/%3E%3C/g%3E%3C/svg%3E")',
    }}
    >
        <div
            style={{
                borderRadius: '5px',
                padding: '10px',
                margin: '0 auto',
                width: '90%',
                background: '#fff',
            }}
        >
            {story()}
        </div>
    </div>
)