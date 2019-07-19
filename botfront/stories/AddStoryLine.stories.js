import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select } from '@storybook/addon-knobs';
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

storiesOf('AddStoryLine', module)
    .addDecorator(withKnobs)
    .addDecorator(story => (
        <Context.Provider
            value={{
                slots: select('Available slots', selection, noSlots),
                responses,
            }}
        >
            {story()}
        </Context.Provider>
    ))
    .add('default', () => (
        <AddStoryLine
            availableActions={select('Available actions', availableActions, availableActions.selectionOne)}
            onClickUserUtterance={() => alert('user says!!')}
            onSelectResponse={r => alert(`${r.name}!!`)}
            onCreateResponse={r => alert(`${r}!!`)}
            onSelectAction={action => alert(`${action}!!`)}
            onSelectSlot={slot => alert(`${slot.name}!!`)}
        />
    ));
