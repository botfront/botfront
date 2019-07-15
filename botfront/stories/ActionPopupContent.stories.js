import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import ActionPopupContent from '../imports/ui/components/stories/common/ActionPopupContent';
import DashedButton from '../imports/ui/components/stories/common/DashedButton';

const trigger = <DashedButton color='violet'>Action</DashedButton>;

storiesOf('ActionPopupContent', module)
    .addDecorator(withKnobs)
    .add('default', () => (
        <ActionPopupContent
            onChange={action => alert(`${action}!!`)}
            trigger={trigger}
        />
    ));
