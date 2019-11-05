import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select, text } from '@storybook/addon-knobs';
import DashedButton from '../imports/ui/components/stories/common/DashedButton';

export const color = {
    red: 'red',
    orange: 'orange',
    yellow: 'yellow',
    olive: 'olive',
    green: 'green',
    teal: 'teal',
    blue: 'blue',
    violet: 'violet',
    purple: 'purple',
    pink: 'pink',
    brown: 'brown',
    grey: 'grey',
    black: 'black',
    botfrontBlue: 'botfront-blue',
};

const size = {
    mini: 'mini',
    tiny: 'tiny',
    small: 'small',
    medium: 'medium',
    large: 'large',
    big: 'big',
    huge: 'huge',
    massive: 'massive',
};

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
