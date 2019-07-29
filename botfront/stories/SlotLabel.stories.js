import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { storiesOf } from '@storybook/react';
import { withKnobs, select } from '@storybook/addon-knobs';
import { ConversationOptionsContext } from '../imports/ui/components/utils/Context';
import SlotLabel from '../imports/ui/components/stories/SlotLabel';
import store from '../imports/ui/store/store';

const noSlots = [];

const selectionOne = [
    { name: 'textSlot1', type: 'text' }, { name: 'textSlot2', type: 'text' }, { name: 'textSlot3', type: 'text' },
];

const selectionTwo = [
    ...selectionOne,
    { name: 'catSlot1', type: 'categorical', categories: ['c1'] }, { name: 'catSlot2', type: 'categorical', categories: ['c2'] }, { name: 'catSlot3', type: 'categorical', categories: ['c3'] },
    { name: 'listSlot1', type: 'list' }, { name: 'listSlot2', type: 'list' }, { name: 'listSlot3', type: 'list' },
];

const selectionThree = [
    ...selectionTwo,
    { name: 'boolSlot1', type: 'bool' }, { name: 'boolSlot2', type: 'bool' }, { name: 'boolSlot3', type: 'bool' },
];

const selection = {
    noSlots, selectionOne, selectionTwo, selectionThree,
};

const selected = {
    None: null,
    textSlot1: { name: 'textSlot1', type: 'text' },
    textSlot3: { name: 'textSlot3', type: 'text' },
};

function SlotLabelWrapped(props) {
    // Here the user of the component needs to paas the initialValue of slot for the slotValue
    const [defaultAction, setActionName] = useState({ type: 'text', name: 'textSlot1', slotValue: 'null' });
    return (
        <SlotLabel
            {...props}
            value={defaultAction}
            onChange={setActionName}
        />
    );
}

storiesOf('Slot Label', module)
    .addDecorator(withKnobs)
    .addDecorator(story => (
        <Provider store={store}>
            {story()}
        </Provider>
    ))
    .addDecorator(story => (
        <ConversationOptionsContext.Provider
            value={{
                slots: select('Available slots', selection, noSlots),
            }}
        >
            {story()}
        </ConversationOptionsContext.Provider>
    ))
    .add('default', () => (
        <SlotLabelWrapped size={select('size', ['mini', 'tiny'])} value={select('Selected slot', selected, null)} />
    ));
