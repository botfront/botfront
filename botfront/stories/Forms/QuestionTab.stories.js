/* eslint-disable no-alert */
import React from 'react';
import { storiesOf } from '@storybook/react';
import QuestionTab from '../../imports/ui/components/forms/QuestionTab';

const response = {
    __typename: 'TextPayload',
    text: 'please enter the value for this slot',
    name: 'utter_ask_slot1',
};

const WrappedFormEditor = (props) => {
    const { nothing } = props;
    return (
        <div style={{ padding: '50px' }}>
            <QuestionTab
                {...props}
                response={response}
            />
        </div>
    );
};

// storiesOf('FormSettingInterface', module)
//     .add('QuestionTab', () => (
//         <WrappedFormEditor />
//     ));
