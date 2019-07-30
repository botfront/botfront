import React, { useState } from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { storiesOf } from '@storybook/react';
import {
    withKnobs,
} from '@storybook/addon-knobs';
import StoryVisualEditor from '../imports/ui/components/stories/common/StoryVisualEditor';
import { ConversationOptionsContext } from '../imports/ui/components/utils/Context';
import { slots, intents, entities } from './AddStoryLine.stories';
import { utterances } from './UserUtteranceContainer.stories';
import { responses as responseFixtures } from './BotResponseContainer.stories';
import store from '../imports/ui/store/store';

const storyOne = [
    { type: 'action', data: { name: 'bebe' } },
    { type: 'slot', data: { type: 'categorical', slotValue: 'ha', name: 'bebe2' } },
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
];

const StoryVisualEditorWrapped = ({ story: s }) => {
    const [story, setStory] = useState(s);
    const [responses, setResponses] = useState(responseFixtures);

    return (
        <ConversationOptionsContext.Provider
            value={{
                slots,
                entities,
                intents,
                responses,
                lang: 'en',
                updateResponses: setResponses,
            }}
        >
            <div
                style={{
                    height: 'auto',
                    minHeight: '100vh',
                    padding: '15px',
                    backgroundColor: '#ee5522',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 200 200\'%3E%3Cdefs%3E%3ClinearGradient id=\'a\' gradientUnits=\'userSpaceOnUse\' x1=\'100\' y1=\'33\' x2=\'100\' y2=\'-3\'%3E%3Cstop offset=\'0\' stop-color=\'%23000\' stop-opacity=\'0\'/%3E%3Cstop offset=\'1\' stop-color=\'%23000\' stop-opacity=\'1\'/%3E%3C/linearGradient%3E%3ClinearGradient id=\'b\' gradientUnits=\'userSpaceOnUse\' x1=\'100\' y1=\'135\' x2=\'100\' y2=\'97\'%3E%3Cstop offset=\'0\' stop-color=\'%23000\' stop-opacity=\'0\'/%3E%3Cstop offset=\'1\' stop-color=\'%23000\' stop-opacity=\'1\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill=\'%23ca481d\' fill-opacity=\'0.6\'%3E%3Crect x=\'100\' width=\'100\' height=\'100\'/%3E%3Crect y=\'100\' width=\'100\' height=\'100\'/%3E%3C/g%3E%3Cg fill-opacity=\'0.5\'%3E%3Cpolygon fill=\'url(%23a)\' points=\'100 30 0 0 200 0\'/%3E%3Cpolygon fill=\'url(%23b)\' points=\'100 100 0 130 0 100 200 100 200 130\'/%3E%3C/g%3E%3C/svg%3E")',
                }}
            >
                <div
                    style={{
                        borderRadius: '5px',
                        padding: '5px',
                        margin: '0 auto',
                        width: '90%',
                        background: '#fff',
                    }}
                >
                    <StoryVisualEditor
                        story={story}
                        updateStory={setStory}
                    />
                </div>
            </div>
        </ConversationOptionsContext.Provider>
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
    .add('default', () => (
        <Provider store={store}>
            <StoryVisualEditorWrapped story={storyOne} />
        </Provider>
    ));
