import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select } from '@storybook/addon-knobs';
import { Button } from 'semantic-ui-react'; 
import SlotPopupContent from '../imports/ui/components/stories/common/SlotPopupContent';

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

const selection = { selectionOne, selectionTwo, selectionThree };

const selected = {
    None: null,
    textSlot1: { name: 'textSlot1', type: 'text' },
    floatSlot2: { name: 'floatSlot2', type: 'float' },
    textSlot3: { name: 'textSlot3', type: 'text' },
};

const trigger = <Button color='orange' basic content='Slots' />;

storiesOf('SlotPopupContent', module)
    .addDecorator(withKnobs)
    .add('with no available slots', () => (
        <SlotPopupContent
            trigger={trigger}
        />
    ))
    .add('with available slots', () => (
        <SlotPopupContent
            available={select('Available slots', selection, selectionOne)}
            value={select('Selected slot', selected, null)}
            onChange={slot => alert(`${slot.name}!!`)}
            trigger={trigger}
        />
    ));
