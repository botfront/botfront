import React from 'react';
import { withKnobs, select, text } from '@storybook/addon-knobs';
import { color } from '../../.storybook/knobs';
import GenericLabel from '../../imports/ui/components/stories/GenericLabel';

export default {
    title: 'StoryLabels/GenericLabel',
    component: GenericLabel,
    decorators: [withKnobs],
};

export const Basic = () => (
    <GenericLabel
        label={text('label', 'label')}
        value={text('value', 'value')}
        color={select('color', color, 'red')}
    />
);
