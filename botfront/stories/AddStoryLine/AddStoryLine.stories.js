/* eslint-disable no-alert */
import React from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, select, boolean } from '@storybook/addon-knobs';
import { size } from '../../.storybook/knobs';
import AddStoryLine from '../../imports/ui/components/stories/common/AddStoryLine';

const availableActions = {
    selectionOne: {
        action: true, slot: true,
    },
    selectionTwo: {
        userUtterance: true,
    },
    selectionThree: {
        userUtterance: true, botUtterance: true, action: true, slot: true,
    },
};

const wrapper = story => (
    <div className='story-visual-editor'>
        {story()}
    </div>
);

export default {
    title: 'AddStoryLine/AddStoryLine',
    component: AddStoryLine,
    decorators: [withKnobs, wrapper],
};

export const Basic = () => (
    <AddStoryLine
        size={select('size', size, 'small')}
        availableActions={select('Available actions', availableActions, availableActions.selectionOne)}
        noButtonResponse={boolean('Disable button responses', false)}
        onCreateUtteranceFromInput={action('onCreateUtteranceFromInput')}
        onCreateUtteranceFromPayload={action('onCreateUtteranceFromPayload')}
        onSelectResponse={action('onSelectResponse')}
        onCreateResponse={action('onCreateResponse')}
        onSelectAction={action('onSelectAction')}
        onSelectSlot={action('onSelectSlot')}
    />
);
