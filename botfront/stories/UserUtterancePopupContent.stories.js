/* eslint-disable no-alert */
import React from 'react';
import { storiesOf } from '@storybook/react';
import UserUtterancePopupContent from '../imports/ui/components/stories/common/UserUtterancePopupContent';
import DashedButton from '../imports/ui/components/stories/common/DashedButton';

const alertPayload = pl => alert(`
    Intent: ${pl.intent}
    ${pl.entities.length ? `Entities: ${pl.entities.map(e => `
        ${e.entity} ${e.entityValue ? `(${e.entityValue})` : ''}`)}
    ` : ''}
    `);

const trigger = <DashedButton color='blue'>User says:</DashedButton>;

storiesOf('UserUtterancePopupContent', module)
    .add('default', () => (
        <UserUtterancePopupContent
            onCreateFromInput={() => alert('from input!!')}
            onCreateFromPayload={u => alertPayload(u)}
            trigger={trigger}
        />
    ));
