import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import {
    withKnobs, text, select, boolean,
} from '@storybook/addon-knobs';
import QuickReplies from '../imports/ui/components/stories/common/QuickReplies';
import { ConversationOptionsContext } from '../imports/ui/components/utils/Context';

export const intents = ['intent1', 'intent2', 'intent3', 'intent4'];

export const entities = ['entity1', 'entity2', 'entity3', 'entity4'];

const values = [
    {
        title: 'short',
        type: 'postback',
        payload: '/intent2',
    },
    {
        title: 'a very long text',
        type: 'postback',
        payload: '/intent1{"entity1":"value"}',
    },
    {
        title: 'a very long text',
        type: 'url',
        payload: 'http://www.google.com',
    },
];


const QuickRepliesWrapped = (props) => {
    const { value } = props;
    const [buttons, setButtons] = useState(value);
    return (
        <QuickReplies
            {...props}
            value={buttons}
            onChange={(b) => {
                setButtons(b);  console.log(b);
            }}
        />
    );
};

storiesOf('QuickReplies', module)
    .addDecorator(withKnobs)
    .addDecorator(buttons => (
        <ConversationOptionsContext.Provider value={{ intents, entities }}>
            {buttons()}
        </ConversationOptionsContext.Provider>
    ))
    .add('Buttons', () => <QuickRepliesWrapped value={values} />)
    .add('With max 2', () => <QuickRepliesWrapped value={values} max={3} />);
