/* eslint-disable no-alert */
import React from 'react';
import { storiesOf } from '@storybook/react';
import FormCreator from '../../imports/ui/components/forms/CreateForm';


const WrappedFormEditor = props => (
    <div style={{ padding: '50px' }}>
        <FormCreator
            {...props}
        />
    </div>
);

storiesOf('Formcreator', module)
    .add('default', () => (
        <WrappedFormEditor />
    ));
