import React, { useState } from 'react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { withBackground } from '../../.storybook/decorators';
import IntentLabel from '../../imports/ui/components/nlu/common/IntentLabel';

function IntentLabelWrapped(props) {
    const [intent, setIntent] = useState('YAY2');
    return (
        <IntentLabel
            value={intent}
            onChange={newIntent => setIntent(newIntent)}
            {...props}
        />
    );
}

export default {
    title: 'StoryLabels/IntentLabel',
    component: IntentLabel,
    decorators: [withKnobs, withBackground],
};

export const Basic = () => (
    <IntentLabelWrapped
        allowEditing={boolean('allowEditing', true)}
        disabled={boolean('disabled', false)}
        enableReset={boolean('enableReset', false)}
        allowAdditions={boolean('allowAdditions', true)}
    />
);
