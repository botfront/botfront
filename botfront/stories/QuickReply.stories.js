import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import {
    withKnobs, text, select, boolean,
} from '@storybook/addon-knobs';
import QuickReply from '../imports/ui/components/stories/common/QuickReply';
import { ProjectContext } from '../imports/ui/layouts/context';

export const intents = ['intent1', 'intent2', 'intent3', 'intent4'];

export const entities = ['entity1', 'entity2', 'entity3', 'entity4'];

const values = [{
    title: 'short',
    type: 'postback',
    payload: '/intent',
},
{
    title: 'a very long text',
    type: 'postback',
    payload: '/intent',
}];

const handleChange = button => alert(JSON.stringify(button));

const QuickReplyWrapped = (props) => {
    const { value } = props;
    const [button, setButton] = useState(value);
    return (
        <QuickReply
            {...props}
            value={button}
            onChange={(b) => { setButton(b); /* handleChange(b); */ }}
        />
    );
};

const stories = storiesOf('QuickReply', module).addDecorator(withKnobs);
stories.addDecorator(button => (
    <ProjectContext.Provider
        value={{ intents, entities }}
    >
        {button()}
    </ProjectContext.Provider>
));
values.forEach(v => stories.add(v.title, () => <QuickReplyWrapped value={v} />));
