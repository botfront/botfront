/* eslint-disable no-alert */
import React from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import BotResponsePopupContent from '../../imports/ui/components/stories/common/BotResponsePopupContent';
import DashedButton from '../../imports/ui/components/stories/common/DashedButton';

export default {
    title: 'AddStoryLine/BotResponsePopupContent',
    component: BotResponsePopupContent,
    decorators: [withKnobs],
};

export const Basic = () => (
    <BotResponsePopupContent
        onSelect={action('onSelect')}
        onCreate={action('onCreate')}
        trigger={<DashedButton color='green'>Bot Response</DashedButton>}
        noButtonResponse={boolean('Disable button responses', false)}
        limitedSelection={boolean('Limited selection', false)}
    />
);
