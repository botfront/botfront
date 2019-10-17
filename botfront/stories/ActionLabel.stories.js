import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import ActionLabel from '../imports/ui/components/stories/ActionLabel';

function ActionLabelWrapped(props) {
    const [defaultAction, setActionName] = useState('Action Name');
    return (
        <ActionLabel
            {...props}
            value={defaultAction}
            onChange={setActionName}
        />
    );
}

storiesOf('Action Label', module)
    .add('default', () => (
        <ActionLabelWrapped />
    ));
