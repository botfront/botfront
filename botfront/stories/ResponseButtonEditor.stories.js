/* eslint-disable no-alert */
import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import {
    withKnobs, text, select, boolean,
} from '@storybook/addon-knobs';
import ResponseButtonEditor from '../imports/ui/components/stories/common/ResponseButtonEditor';
// import { ConversationOptionsContext } from '../imports/ui/components/utils/Context';

// export const intents = ['intent1', 'intent2', 'intent3', 'intent4'];

// export const entities = ['entity1', 'entity2', 'entity3', 'entity4'];

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
// stories.addDecorator(payload => (
//     <ConversationOptionsContext.Provider
//         value={{ intents, entities }}
//     >
//         {payload()}
//     </ConversationOptionsContext.Provider>
// ));
values.forEach(v => stories.add(v.title, () => <ResponseButtonEditorWrapped value={v} />));
