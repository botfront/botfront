import React from 'react';
import { storiesOf } from '@storybook/react';
import ChangesSaved from '../imports/ui/components/utils/ChangesSaved';

storiesOf('ChangesSaved', module)
    .add('default', () => <ChangesSaved />)
    .add('with title', () => <ChangesSaved title='Saved ✅' />);
