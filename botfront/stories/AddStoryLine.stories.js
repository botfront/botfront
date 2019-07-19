import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select, boolean } from '@storybook/addon-knobs';
import AddStoryLine from '../imports/ui/components/stories/common/AddStoryLine';
import Context from '../imports/ui/components/stories/common/Context';

const noSlots = [];

const selectionOne = [
    { name: 'textSlot1', type: 'text' }, { name: 'textSlot2', type: 'text' }, { name: 'textSlot3', type: 'text' },
    { name: 'floatSlot1', type: 'float' }, { name: 'floatSlot2', type: 'float' }, { name: 'floatSlot3', type: 'float' },
];

const selectionTwo = [
    ...selectionOne,
    { name: 'catSlot1', type: 'categorical' }, { name: 'catSlot2', type: 'categorical' }, { name: 'catSlot3', type: 'categorical' },
    { name: 'listSlot1', type: 'list' }, { name: 'listSlot2', type: 'list' }, { name: 'listSlot3', type: 'list' },
];

const selectionThree = [
    ...selectionTwo,
    { name: 'boolSlot1', type: 'bool' }, { name: 'boolSlot2', type: 'bool' }, { name: 'boolSlot3', type: 'bool' },
    { name: 'unfeatSlot1', type: 'unfeaturized' }, { name: 'unfeatSlot2', type: 'unfeaturized' }, { name: 'unfeatSlot3', type: 'unfeaturized' },
];

const selection = {
    noSlots, selectionOne, selectionTwo, selectionThree,
};

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

const intents = [
    { text: 'intent1', value: 'intent1' },
    { text: 'intent2', value: 'intent2' },
    { text: 'intent3', value: 'intent3' },
    { text: 'intent4', value: 'intent4' },
];

const entities = [
    { entity: 'entity1', value: 'entity1' },
    { entity: 'entity2', value: 'entity2' },
    { entity: 'entity3', value: 'entity3' },
    { entity: 'entity4', value: 'entity4' },
];

const alertPayload = pl => alert(`
    Intent: ${pl.intent}
    ${pl.entities.length ? `Entities: ${pl.entities.map(e => `
        ${e.entity} ${e.entityValue ? `(${e.entityValue})` : ''}`)}
    ` : ''}
    `);

storiesOf('AddStoryLine', module)
    .addDecorator(withKnobs)
    .addDecorator(story => (
        <Context.Provider
            value={{
                slots: select('Available slots', selection, noSlots),
                responses,
                intents,
                entities,
            }}
        >
            {story()}
        </Context.Provider>
    ))
    .add('default', () => (
        <AddStoryLine
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
