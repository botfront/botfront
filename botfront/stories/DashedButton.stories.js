import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select, text } from '@storybook/addon-knobs';
import DashedButton from '../imports/ui/components/stories/common/DashedButton';

const color = {
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

storiesOf('DashedButton', module)
    .addDecorator(withKnobs)
    .add('default', () => (
        <DashedButton content='Slots' color={select('color', color, 'orange')}>{text('text', 'Click me')}</DashedButton>
    ));
