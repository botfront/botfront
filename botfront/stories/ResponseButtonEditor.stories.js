/* eslint-disable no-alert */
import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import {
    withKnobs, text, select, boolean,
} from '@storybook/addon-knobs';
import ResponseButtonEditor from '../imports/ui/components/stories/common/ResponseButtonEditor';

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

const handleChange = button => alert(JSON.stringify(button));

const ResponseButtonEditorWrapped = (props) => {
    const { value } = props;
    const [button, setButton] = useState(value);
    return (
        <ResponseButtonEditor
            {...props}
            value={button}
            onChange={(b) => { setButton(b); handleChange(b); }}
        />
    );
};

const stories = storiesOf('ResponseButtonEditor', module);
stories.addDecorator(withKnobs);
values.forEach(v => stories.add(v.title, () => <ResponseButtonEditorWrapped value={v} />));
