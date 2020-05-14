import React from 'react';
import { withKnobs, boolean, text } from '@storybook/addon-knobs';
import SaveButton from '../../imports/ui/components/utils/SaveButton';

export default {
    title: '_basic/SaveButton',
    component: SaveButton,
    decorators: [withKnobs],
};

export const Basic = () => <SaveButton />;
export const CustomText = () => (
    <SaveButton saveText={text('Button text', 'Click to save')} />
);
export const WithProps = () => <SaveButton saving={boolean('Saving', false)} saved={boolean('Saved', false)} />;
