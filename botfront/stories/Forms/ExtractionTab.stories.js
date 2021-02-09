/* eslint-disable no-alert */
import React from 'react';
import { storiesOf } from '@storybook/react';
import ExtractionItem from '../../imports/ui/components/forms/ExtractionItem';

const response = {
    __typename: 'TextPayload',
    text: 'please enter the value for this slot',
    name: 'utter_ask_slot1',
};

const intents = [
    'chitchat.greet',
    'chitchat.bye',
];

const WrappedFormEditor = (props) => {
    const { nothing } = props;
    return (
        <div style={{ padding: '50px' }}>
            <ExtractionItem
                {...props}
                response={response}
            />
        </div>
    );
};

// storiesOf('FormSettingInterface', module)
//     .add('ExtractionTab', () => (
//         <WrappedFormEditor intents={intents} />
//     ));
