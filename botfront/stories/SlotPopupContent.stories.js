import React from 'react';
import { storiesOf } from '@storybook/react';
import { Provider } from 'react-redux';
import { withKnobs, select } from '@storybook/addon-knobs';
import { ConversationOptionsContext } from '../imports/ui/components/utils/Context';
import store from '../imports/ui/store/store';
import SlotPopupContent from '../imports/ui/components/stories/common/SlotPopupContent';
import DashedButton from '../imports/ui/components/stories/common/DashedButton';

const noSlots = [];

const selectionOne = [
    { name: 'textSlot1', type: 'text' }, { name: 'textSlot2', type: 'text' }, { name: 'textSlot3', type: 'text' },
];

const selectionTwo = [
    ...selectionOne,
    { name: 'catSlot1', type: 'categorical', categories: ['cat1a', 'cat1b'] }, { name: 'catSlot2', type: 'categorical', categories: ['cat2a', 'cat2b'] }, { name: 'catSlot3', type: 'categorical', categories: ['cat3a', 'cat3b'] },
    { name: 'listSlot1', type: 'list' }, { name: 'listSlot2', type: 'list' }, { name: 'listSlot3', type: 'list' },
];

export const selectionThree = [
    ...selectionTwo,
    { name: 'boolSlot1', type: 'bool' }, { name: 'boolSlot2', type: 'bool' }, { name: 'boolSlot3', type: 'bool' },
];

export const selection = {
    noSlots, selectionOne, selectionTwo, selectionThree,
};

const selected = {
    None: null,
    textSlot1: { name: 'textSlot1', type: 'text' },
    textSlot3: { name: 'textSlot3', type: 'text' },
};

const trigger = <DashedButton color='orange'>Slot</DashedButton>;

storiesOf('SlotPopupContent', module)
    .addDecorator(withKnobs)
    .addDecorator(story => (
        <div className='story-visual-editor'>
            <ConversationOptionsContext.Provider
                value={{
                    slots: select('Available slots', selection, noSlots),
                }}
            >
                {story()}
            </ConversationOptionsContext.Provider>
        </div>
    ))
    .add('default', () => (
        <Provider store={store}>
            <SlotPopupContent
                value={select('Selected slot', selected, null)}
                // eslint-disable-next-line no-alert
                onSelect={slot => alert(`${slot.name} & ${slot.slotValue}!!`)}
                trigger={trigger}
            />
        </Provider>
    ));
