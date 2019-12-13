/* eslint-disable no-alert */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import BotResponsePopupContent from '../imports/ui/components/stories/common/BotResponsePopupContent';
import DashedButton from '../imports/ui/components/stories/common/DashedButton';

const trigger = <DashedButton color='green'>Bot Response</DashedButton>;

storiesOf('BotResponsePopupContent', module)
    .addDecorator(withKnobs)
    .add('default', () => (
        <BotResponsePopupContent
            onSelect={r => alert(`${r.name}!!`)}
            onCreate={r => alert(`${r}!!`)}
            trigger={trigger}
            noButtonResponse={boolean('Disable button responses', false)}
            limitedSelection={boolean('Limited selection', false)}
        />
    ));
