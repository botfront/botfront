import React, { useState } from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import { withBackground } from '../.storybook/decorators';
import store from '../imports/ui/store/store';
import { StoryController } from '../imports/lib/story_controller';
import StoryVisualEditor from '../imports/ui/components/stories/common/StoryVisualEditor';
import { ConversationOptionsContext } from '../imports/ui/components/stories/Context';
import { slots, intents, entities } from './AddStoryLine.stories';
import { responses as responseFixtures } from './BotResponseContainer.stories';
import { OOS_LABEL } from '../imports/ui/components/constants.json';

/* const storyOne = [
    { type: 'action', data: { name: 'action_bebe' } },
    { type: 'slot', data: { type: 'categorical', slotValue: 'cat1a', name: 'catSlot1' } },
    {
        type: 'user',
        data: [utterances.utteranceOne],
    },
    { type: 'bot', data: { name: 'utter_yay' } },
    {
        type: 'user',
        data: [utterances.utteranceTwo],
    },
    { type: 'bot', data: { name: 'utter_boo' } },
    {
        type: 'user',
        data: [utterances.utteranceThree],
    },
]; */

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
    const [responses, setResponses] = useState(responseFixtures);

    const getUtteranceFromPayload = u => ({
        ...u, text: 'recovered from db',
    });

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
        <Provider store={store}>
            <ConversationOptionsContext.Provider
                value={{
                    slots,
                    entities,
                    intents,
                    responses,
                    lang: 'en',
                    updateResponses: setResponses,
                    getUtteranceFromPayload,
                    parseUtterance,
                    getResponse,
                }}
            >
                <StoryVisualEditor story={story} />
            </ConversationOptionsContext.Provider>
        </Provider>
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
    .addDecorator(withBackground)
    .add('default', () => (
        <Provider store={store}>
            <StoryVisualEditorWrapped story={storyOne} />
        </Provider>
    ));
