import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select, text } from '@storybook/addon-knobs';
import { color } from './DashedButton.stories';
import GenericLabel from '../imports/ui/components/stories/GenericLabel';

storiesOf('Generic Label', module)
    .addDecorator(withKnobs)
    .add('default', () => (
        <GenericLabel
            label={text('label', 'label')}
            value={text('value', 'value')}
            color={select('color', color, 'red')}
        />
    ));
