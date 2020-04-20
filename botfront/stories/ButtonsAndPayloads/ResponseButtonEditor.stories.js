/* eslint-disable no-alert */
import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { withBackground } from '../../.storybook/decorators';
import ResponseButtonEditor from '../../imports/ui/components/stories/common/ResponseButtonEditor';

const values = [{
    title: 'short',
    type: 'postback',
    payload: '/intent1{"entity1":"qwe","entity2":"qwe2","entity3":"qwe3"}',
},
{
    title: 'a very long text',
    type: 'url',
    payload: 'http://google.com',
}];

const ResponseButtonEditorWrapped = (props) => {
    const { value } = props;
    const [button, setButton] = useState(value);
    return (
        <ResponseButtonEditor
            {...props}
            value={button}
            noButtonTitle={boolean('noButtonTitle', false)}
            onChange={(...args) => { setButton(...args); action('onChange')(...args); }}
        />
    );
};

export default {
    title: 'ButtonsAndPayloads/ResponseButtonEditor',
    component: ResponseButtonEditor,
    decorators: [withKnobs, withBackground],
};

export const Short = () => <ResponseButtonEditorWrapped value={values[0]} />;
export const VeryLongText = () => <ResponseButtonEditorWrapped value={values[1]} />;
