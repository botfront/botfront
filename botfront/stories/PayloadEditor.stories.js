/* eslint-disable no-alert */
import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import PayloadEditor from '../imports/ui/components/stories/common/PayloadEditor';

const emptyPayload = { intent: null, entities: [] };
const payloadOne = {
    intent: 'intent1',
    entities: [{ entity: 'entity3', value: 'HOHO' }, { entity: 'entity4', value: 'HEHE' }],
};
const payloadTwo = { intent: 'intent2', entities: [] };

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
};

storiesOf('PayloadEditor', module)
    .add('emptyPayload', () => (
        <PayloadEditorWrapped value={emptyPayload} />
    ))
    .add('payloadOne', () => (
        <PayloadEditorWrapped value={payloadOne} />
    ))
    .add('payloadTwo', () => (
        <PayloadEditorWrapped value={payloadTwo} />
    ));
