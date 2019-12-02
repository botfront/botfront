/* eslint-disable no-alert */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select, boolean } from '@storybook/addon-knobs';
import { size } from '../.storybook/knobs';
import AddStoryLine from '../imports/ui/components/stories/common/AddStoryLine';

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

const alertPayload = pl => alert(`
    Intent: ${pl.intent}
    ${pl.entities.length ? `Entities: ${pl.entities.map(e => `
        ${e.entity} ${e.entityValue ? `(${e.entityValue})` : ''}`)}
    ` : ''}
    `);

storiesOf('AddStoryLine', module)
    .addDecorator(withKnobs)
    .addDecorator(story => (
        <div className='story-visual-editor'>
            {story()}
        </div>
    ))
    .add('default', () => (
        <AddStoryLine
            size={select('size', size, 'small')}
            availableActions={select('Available actions', availableActions, availableActions.selectionOne)}
            noButtonResponse={boolean('Disable button responses', false)}
            onCreateUtteranceFromInput={() => alert('from input!!')}
            onCreateUtteranceFromPayload={u => alertPayload(u)}
            onSelectResponse={r => alert(`${r.name}!!`)}
            onCreateResponse={r => alert(`${r}!!`)}
            onSelectAction={action => alert(`${action}!!`)}
            onSelectSlot={slot => alert(`${slot.name}!!`)}
        />
    ));
