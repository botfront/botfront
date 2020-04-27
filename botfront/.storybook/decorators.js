import React, { useState, useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { ProjectContext } from '../imports/ui/layouts/context';
import { ConversationOptionsContext } from '../imports/ui/components/stories/Context';
import store from '../imports/ui/store/store';
import { OOS_LABEL } from '../imports/ui/components/constants.json';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import style from './style.css';

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
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut\n                  labore et dolore magna aliqua.',
    },
    utter_boo: {
        __typename: 'TextPayload',
        text: 'I love peanutes too\n\nCan I call u l8r?',
    },
    utter_carou: {
        __typename: 'CarouselPayload',
        elements: [
            {
                title: 'Mulberry',
                subtitle: 'Leaves eaten by silk worms.',
                image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRxfonrZq1gxu7V9JJ7XlETWvpn5EHF-eNF-k-nAiT5AqMOcHtj&usqp=CAU',
            },
        ],
    }
}
const utteranceFixtures = [utteranceOne, utteranceTwo, utteranceThree]
    .reduce((acc, curr) => ({ ...acc, [curr.text]: curr }), {});

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
                        content.filter(u => u.text).reduce((acc, curr) => ({ ...acc, [curr.text]: curr }), utterances),
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

export const withBackground = (story) => {
    const resizeBox = useRef();

    /* this is useful for some components that rely on window resize events
        to rerender properly (textAreaAutoresize), but here we want resizing the box
        to do the same */
    const propagateResize = () => window.dispatchEvent(new Event('resize'));
    const resizeObserver = new ResizeObserver(propagateResize);
    useEffect(() => {
        resizeObserver.observe(resizeBox.current);
        return () => resizeObserver.unobserve(resizeBox.current);
    }, [])

    return (
        <DndProvider backend={HTML5Backend}>
            <div className='background'>
                <div ref={resizeBox} className='resize-box'>
                    <br />
                    <div className='content-box'>
                        {story()}
                    </div>
                    <br />
                    <div className='notice'>
                        <span>&larr;</span>
                        <span>change width using NE corner</span>
                        <span>&rarr;</span>
                    </div>
                </div>
            </div>
    </DndProvider>  
    )
}
