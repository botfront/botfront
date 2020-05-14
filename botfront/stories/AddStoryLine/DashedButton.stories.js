import React from 'react';
import { withKnobs, select, text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import DashedButton from '../../imports/ui/components/stories/common/DashedButton';
import { size, color } from '../../.storybook/knobs';

export default {
    title: 'AddStoryLine/DashedButton',
    component: DashedButton,
    decorators: [withKnobs],
};

export const Basic = () => (
    <DashedButton
        color={select('color', color, 'orange')}
        size={select('size', size, 'small')}
        onClick={action('onClick')}
    >
        {text('text', 'Click me')}
    </DashedButton>
);
