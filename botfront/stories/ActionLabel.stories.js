import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select } from '@storybook/addon-knobs';
import { Label } from 'semantic-ui-react';
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
    .addDecorator(withKnobs)
    .addDecorator(renderLabel => <Label>{renderLabel()}</Label>)
    .add('default', () => (
        <ActionLabelWrapped size={select('size', ['mini', 'tiny'])} />
    ));
