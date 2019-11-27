import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select, boolean } from '@storybook/addon-knobs';
import AddStoryLine from '../imports/ui/components/stories/common/AddStoryLine';
import { ProjectContext } from '../imports/ui/layouts/context';
import { intents, entities } from './PayloadEditor.stories';
import { selectionThree as slots } from './SlotPopupContent.stories';

export { intents, entities, slots };

const responses = [
    { name: 'YO' },
    { name: 'blah' },
    { name: 'doodoo' },
];

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

const size = {
    mini: 'mini',
    tiny: 'tiny',
    small: 'small',
    medium: 'medium',
    large: 'large',
    big: 'big',
    huge: 'huge',
    massive: 'massive',
};

storiesOf('AddStoryLine', module)
    .addDecorator(withKnobs)
    .addDecorator(story => (
        <div className='story-visual-editor'>
            <ProjectContext.Provider
                value={{
                    slots,
                    responses,
                    intents,
                    entities,
                }}
            >
                {story()}
            </ProjectContext.Provider>
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
