import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import PayloadEditor from '../imports/ui/components/stories/common/PayloadEditor';
import { ConversationOptionsContext } from '../imports/ui/components/utils/Context';

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

const none = { intent: null, entities: [] };
const value1 = {
    intent: 'intent1',
    entities: [{ entity: 'entity3', value: 'entity3', entityValue: 'HOHO' }, { entity: 'entity4', value: 'entity4', entityValue: 'HEHE' }],
};
const value2 = { intent: 'intent2', entities: [] };

const handleChange = pl => alert(`
    Intent: ${pl.intent}
    ${pl.entities.length ? `Entities: ${pl.entities.map(e => `
        ${e.entity} ${e.entityValue ? `(${e.entityValue})` : ''}`)}
    ` : ''}
    `);

const PayloadEditorWrapped = (props) => {
    const { value } = props;
    const [payload, setPayload] = useState(value);
    return (
        <PayloadEditor
            {...props}
            value={payload}
            onChange={(pl) => { setPayload(pl); handleChange(pl); }}
        />
    );
}

storiesOf('PayloadEditor', module)
    .addDecorator(story => (
        <ConversationOptionsContext.Provider
            value={{ intents, entities }}
        >
            {story()}
        </ConversationOptionsContext.Provider>
    ))
    .add('noVal', () => (
        <PayloadEditorWrapped
            value={none}
        />
    ))
    .add('value1', () => (
        <PayloadEditorWrapped
            value={value1}
        />
    ))
    .add('value2', () => (
        <PayloadEditorWrapped
            value={value2}
        />
    ));
