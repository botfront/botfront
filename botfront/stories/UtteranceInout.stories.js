import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text } from '@storybook/addon-knobs';
import UtteranceInput from '../imports/ui/components/utils/UtteranceInput';

storiesOf('UtteranceInput', module)
    .addDecorator(withKnobs)
    .add('default', () => <UtteranceInput />)
    .add('with value', () => <UtteranceInput value='a test value' />)
    .add('with props', () => (
        <UtteranceInput placeholder={text('placeholder', 'User says')} size={text('size', 'mini')} />
    ));
