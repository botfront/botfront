/* eslint-disable no-alert */
import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { withBackground } from '../../.storybook/decorators';
import PayloadEditor from '../../imports/ui/components/stories/common/PayloadEditor';

const emptyPayload = { intent: null, entities: [] };
const payloadOne = {
    intent: 'intent1',
    entities: [{ entity: 'entity3', value: 'HOHO' }, { entity: 'entity4', value: 'HEHE' }],
};
const payloadTwo = { intent: 'intent2', entities: [] };

const PayloadEditorWrapped = (props) => {
    const { value } = props;
    const [payload, setPayload] = useState(value);
    return (
        <PayloadEditor
            {...props}
            value={payload}
            onChange={(...args) => { setPayload(...args); action('onChange')(...args); }}
            disallowAdvancedEditing={boolean('disallowAdvancedEditing', false)}
        />
    );
};

export default {
    title: 'ButtonsAndPayloads/PayloadEditor',
    component: PayloadEditor,
    decorators: [withKnobs, withBackground],
};

export const EmptyPayload = () => (
    <PayloadEditorWrapped value={emptyPayload} />
);
export const PayloadOne = () => (
    <PayloadEditorWrapped value={payloadOne} />
);
export const PayloadTwo = () => (
    <PayloadEditorWrapped value={payloadTwo} />
);
