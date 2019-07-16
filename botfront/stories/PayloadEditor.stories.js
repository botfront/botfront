import React from 'react';
import { storiesOf } from '@storybook/react';
import PayloadEditor from '../imports/ui/components/stories/common/PayloadEditor';
import Context from '../imports/ui/components/stories/common/Context';

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
    `)

storiesOf('PayloadEditor', module)
    .addDecorator(story => (
        <Context.Provider
            value={{ intents, entities }}
        >
            {story()}
        </Context.Provider>
    ))
    .add('noVal', () => (
        <PayloadEditor
            value={none}
            onChange={handleChange}
        />
    ))
    .add('value1', () => (
        <PayloadEditor
            value={value1}
            onChange={handleChange}
        />
    ))
    .add('value2', () => (
        <PayloadEditor
            value={value2}
            onChange={handleChange}
        />
    ));
