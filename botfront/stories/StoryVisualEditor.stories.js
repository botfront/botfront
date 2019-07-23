import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { storiesOf } from '@storybook/react';
import {
    withKnobs,
} from '@storybook/addon-knobs';
import StoryVisualEditor from '../imports/ui/components/stories/common/StoryVisualEditor';
import { ConversationOptionsContext } from '../imports/ui/components/utils/Context';
import { selectionThree as slots } from './SlotPopupContent.stories';

const responsesOne = {
    utter_yay: ['YAY!!', 'BOO!'],
    utter_boo: ['I love peanutes too', 'Can I call you l8r', '<3'],
};

const storyOne = [
    { type: 'action', data: { name: 'bebe' } },
    { type: 'slot', data: { value: 'ha', name: 'bebe2' } },
    {
        type: 'user',
        data: [
            {
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
            },
        ],
    },
    { type: 'bot', data: { name: 'utter_yay' } },
    {
        type: 'user',
        data: [
            {
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
            },
        ],
    },
    { type: 'bot', data: { name: 'utter_boo' } },
    {
        type: 'user',
        data: [
            {
                intent: 'I_dislike_the_green_stuff',
                entities: [],
                text: `On the first day of the chase, Ahab smells the whale, climbs the mast, and sights Moby Dick. He claims the doubloon for himself, and orders all
boats to lower except for Starbuck's. The whale bites Ahab's boat in two, tosses the captain out of it, and scatters the crew. On the second day of the chase,
Ahab leaves Starbuck in charge of the Pequod. Moby Dick smashes the three boats that seek him into splinters and tangles their lines. Ahab is rescued, but his ivory leg and Fedallah are lost.
Starbuck begs Ahab to desist, but Ahab vows to slay the white whale, even if he would have to dive through the globe itself to get his revenge.`,
            },
        ],
    },
];

const StoryVisualEditorWrapped = ({ story: s }) => {
    const [story, setStory] = useState(s);
    const [responses, setResponses] = useState(responsesOne);

    return (
        <ConversationOptionsContext.Provider
            value={{
                slots,
                entities: [],
                intents: [],
                responses,
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
                        updateResponses={setResponses}
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
        <StoryVisualEditorWrapped story={storyOne} />
    ));
