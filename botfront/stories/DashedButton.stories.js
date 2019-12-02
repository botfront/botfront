import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select, text } from '@storybook/addon-knobs';
import DashedButton from '../imports/ui/components/stories/common/DashedButton';
import { size, color } from '../.storybook/knobs';

storiesOf('DashedButton', module)
    .addDecorator(withKnobs)
    .add('default', () => (
        <DashedButton
            color={select('color', color, 'orange')}
            size={select('size', size, 'small')}
        >
            {text('text', 'Click me')}
        </DashedButton>
    ));
