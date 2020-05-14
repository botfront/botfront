import React from 'react';
import { action } from '@storybook/addon-actions';
import ActionPopupContent from '../../imports/ui/components/stories/common/ActionPopupContent';
import DashedButton from '../../imports/ui/components/stories/common/DashedButton';

export default {
    title: 'AddStoryLine/ActionPopupContent',
    component: ActionPopupContent,
};

export const Basic = () => (
    <ActionPopupContent
        onSelect={action('onSelect')}
        trigger={<DashedButton color='pink'>Action</DashedButton>}
    />
);
