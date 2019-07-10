import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean, text } from '@storybook/addon-knobs';
import SaveButton from '../imports/ui/components/utils/SaveButton';

storiesOf('Save Button', module)
    .addDecorator(withKnobs)
    .add('default', () => <SaveButton />)
    .add('with custom text', () => (
        <SaveButton saveText={text('Button text', 'Click to save')} />
    ))
    .add('with props', () => <SaveButton saving={boolean('Saving', false)} saved={boolean('Saved', false)} />);
