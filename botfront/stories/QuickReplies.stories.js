import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import QuickReplies from '../imports/ui/components/stories/common/QuickReplies';

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
            onChange={setButtons}
        />
    );
};

storiesOf('QuickReplies', module)
    .addDecorator(withKnobs)
    .add('Buttons', () => <QuickRepliesWrapped value={values} />)
    .add('With max 2', () => <QuickRepliesWrapped value={values} max={3} />);
