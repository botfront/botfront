/* eslint-disable no-alert */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select } from '@storybook/addon-knobs';
import FormEditorContainer from '../../imports/ui/components/forms/FormEditorContainer';


const name = 'boolSlot1';
const slotFilling = [{
    type: 'from_entity',
    not_intent: ['chitchat.greet'],
}];
const formName = 'myForm';
const slot = {
    type: 'number',
    categories: ['book', 'cancel', 'move'],
};

const WrappedFormEditor = (props) => {
    const { slotName } = props;
    return (
        <div style={{ padding: '50px' }}>
            <FormEditorContainer
                {...props}
                slotName={slotName || 'textSlot1'}
                formName='my_form'
            />
        </div>
    );
};

storiesOf('FormSettingInterface', module)
    .addDecorator(withKnobs)
    .add('formEditor', () => (
        <WrappedFormEditor slotToFill={{ name, slotFilling }} formName={formName} slot={slot} slotName={select('slot name', ['textSlot1', 'catSlot1'])} />
    ));
