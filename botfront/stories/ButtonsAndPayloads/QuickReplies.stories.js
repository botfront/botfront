import React, { useState } from 'react';
import { withKnobs, number, boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withBackground } from '../../.storybook/decorators';

import QuickReplies from '../../imports/ui/components/stories/common/QuickReplies';

const values = [
    {
        title: 'short',
        type: 'postback',
        payload: '/intent2',
    },
    {
        title: 'pretty long long long for a quick quick quick button eh',
        type: 'postback',
        payload: '/intent1{"entity1":"value"}',
    },
    {
        title: 'here\'s a link',
        type: 'web_url',
        url: 'http://www.google.com',
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
    decorators: [withKnobs, withBackground],
};

export const Basic = () => (
    <QuickRepliesWrapped
        value={values}
        max={number('Max n buttons', 4)}
        min={number('Min n buttons', 1)}
        fluid={boolean('fluid', false)}
    />
);
