import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import { ConversationOptionsContext } from '../imports/ui/components/utils/Context';
import UserUtterancePopupContent from '../imports/ui/components/stories/common/UserUtterancePopupContent';
import DashedButton from '../imports/ui/components/stories/common/DashedButton';

const intents = [
    { text: 'intent1', value: 'intent1' },
    { text: 'intent2', value: 'intent2' },
    { text: 'intent3', value: 'intent3' },
    { text: 'intent4', value: 'intent4' },
];

const entities = [
    { entity: 'entity1', value: 'entity1' },
    { entity: 'entity2', value: 'entity2' },
    { entity: 'entity3', value: 'entity3' },
    { entity: 'entity4', value: 'entity4' },
];

const alertPayload = pl => alert(`
    Intent: ${pl.intent}
    ${pl.entities.length ? `Entities: ${pl.entities.map(e => `
        ${e.entity} ${e.entityValue ? `(${e.entityValue})` : ''}`)}
    ` : ''}
    `);

const trigger = <DashedButton color='blue'>User says:</DashedButton>;

storiesOf('UserUtterancePopupContent', module)
    .addDecorator(withKnobs)
    .addDecorator(story => (
        <ConversationOptionsContext.Provider value={{ intents, entities }}>
            {story()}
        </ConversationOptionsContext.Provider>
    ))
    .add('default', () => (
        <UserUtterancePopupContent
            onCreateFromInput={() => alert('from input!!')}
            onCreateFromPayload={u => alertPayload(u)}
            trigger={trigger}
        />
    ));
