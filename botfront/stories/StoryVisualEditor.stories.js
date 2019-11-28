import React, { useState } from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import { withBackground, withProvider } from '../.storybook/decorators';
import store from '../imports/ui/store/store';
import { StoryController } from '../imports/lib/story_controller';
import StoryVisualEditor from '../imports/ui/components/stories/common/StoryVisualEditor';
import { ProjectContext } from '../imports/ui/layouts/context';
import { slots, intents, entities } from './AddStoryLine.stories';
import { OOS_LABEL } from '../imports/ui/components/constants.json';

const responseOne = {
    key: 'utter_yay',
    values: [{
        lang: 'en',
        sequence: [
            { content: 'text: YAY!!' },
            { content: 'text: BOO!!' },
            { content: 'text: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
        ],
    }],
};

const responseTwo = {
    key: 'utter_boo',
    values: [{
        lang: 'en',
        sequence: [
            { content: 'text: I love peanutes too' },
            { content: 'text: Can I call you l8r' },
            { content: 'text: <3' },
        ],
    }],
};

const responseFixtures = [responseOne, responseTwo];

const utteranceOne = {
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
    intent: 'Im_summarizing_Moby_Dick',
    entities: [],
    text: `On the first day of the chase, Ahab smells the whale, climbs the mast, and sights Moby Dick. He claims the doubloon for himself, and orders all
boats to lower except for Starbuck's. The whale bites Ahab's boat in two, tosses the captain out of it, and scatters the crew. On the second day of the chase,
Ahab leaves Starbuck in charge of the Pequod. Moby Dick smashes the three boats that seek him into splinters and tangles their lines. Ahab is rescued, but his ivory leg and Fedallah are lost.
Starbuck begs Ahab to desist, but Ahab vows to slay the white whale, even if he would have to dive through the globe itself to get his revenge.`,
};

const utterances = { utteranceOne, utteranceTwo, utteranceThree };
const getUtteranceFromPayload = (intent, callback) => {
    callback(
        null,
        [
            ...Object.values(utterances).filter(u => u.intent === intent.intent),
            { intent, entities: [], text: 'not found' },
        ][0],
    );
};

const storyOne = `    - action_bebe
    - slot{"catSlot1": "cat1a"}
* I_come_from{"from": "Paris"}
    - utter_yay
* I_want_peanuts_on_my_sundae
    - utter_boo
* Im_summarizing_Moby_Dick`;

const StoryVisualEditorWrapped = ({ story: s }) => {
    const [story, setStory] = useState(
        new StoryController(
            s,
            slots,
            () => {
                setStory(Object.assign(Object.create(story), story));
            },
        ),
    );
    const [responses, updateResponses] = useState(responseFixtures);

    const parseUtterance = u => ({
        intent: OOS_LABEL,
        text: u,
    });

    const getResponse = key => ({
        key,
        values: [{
            lang: 'en',
            sequence: [
                { content: 'text: fetched response!!' },
                { content: 'text: fetched response!!' },
                { content: 'text: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
            ],
        }],
    });

    return (
        <ProjectContext.Provider
            value={{
                slots,
                entities,
                intents,
                responses,
                lang: 'en',
                updateResponses,
                getUtteranceFromPayload,
                parseUtterance,
                getResponse,
            }}
        >
            <StoryVisualEditor story={story} />
        </ProjectContext.Provider>
    );
};

StoryVisualEditorWrapped.propTypes = {
    story: PropTypes.array,
};

StoryVisualEditorWrapped.defaultProps = {
    story: [],
};

storiesOf('StoryVisualEditor', module)
    .addDecorator(withKnobs)
    .addDecorator(withProvider)
    .addDecorator(withBackground)
    .add('default', () => (
        <Provider store={store}>
            <StoryVisualEditorWrapped story={storyOne} />
        </Provider>
    ));
