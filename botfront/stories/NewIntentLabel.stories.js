import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { withBackground } from '../.storybook/decorators';
import IntentLabel from '../imports/ui/components/nlu/common/NewIntentLabel';

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

storiesOf('NewIntentLabel', module)
    .addDecorator(withKnobs)
    .addDecorator(withBackground)
    .add('default', () => (
        <IntentLabelWrapped
            allowEditing={boolean('allowEditing', true)}
            disabled={boolean('disabled', false)}
            enableReset={boolean('enableReset', false)}
            allowAdditions={boolean('allowAdditions', true)}
        />
    ));
