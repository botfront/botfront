import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';
import QuickReplies from '../../imports/ui/components/stories/common/QuickReplies';

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
            onChange={(...args) => { setButtons(...args); action('onChange')(...args); }}
        />
    );
};

export default {
    title: 'ButtonsAndPayloads/QuickReplies',
    component: QuickReplies,
};

export const Buttons = () => <QuickRepliesWrapped value={values} />;
export const Max2 = () => <QuickRepliesWrapped value={values} max={3} />;
