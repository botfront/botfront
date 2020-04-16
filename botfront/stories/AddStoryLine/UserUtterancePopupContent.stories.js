/* eslint-disable no-alert */
import React from 'react';
import { action } from '@storybook/addon-actions';
import UserUtterancePopupContent from '../../imports/ui/components/stories/common/UserUtterancePopupContent';
import DashedButton from '../../imports/ui/components/stories/common/DashedButton';

export default {
    title: 'AddStoryLine/UserUtterancePopupContent',
    component: UserUtterancePopupContent,
};

export const Basic = () => (
    <UserUtterancePopupContent
        onCreateFromInput={action('onCreateFromInput')}
        onCreateFromPayload={action('onCreateFromPayload')}
        trigger={<DashedButton color='blue'>User says:</DashedButton>}
    />
);
