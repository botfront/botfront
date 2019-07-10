import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text } from '@storybook/addon-knobs';
import ChangesSaved from '../imports/ui/components/utils/ChangesSaved';

storiesOf('ChangesSaved', module)
    .addDecorator(withKnobs)
    .add('default', () => <ChangesSaved />)
    .add('with variable title', () => <ChangesSaved title={text('Title', 'Saved')} />);
