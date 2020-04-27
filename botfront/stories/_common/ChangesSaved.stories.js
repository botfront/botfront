import React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import ChangesSaved from '../../imports/ui/components/utils/ChangesSaved';

export default {
    title: '_basic/ChangesSaved',
    component: ChangesSaved,
    decorators: [withKnobs],
};

export const Basic = () => <ChangesSaved />;
export const VariableTitle = () => <ChangesSaved title={text('Title', 'Saved')} />;
