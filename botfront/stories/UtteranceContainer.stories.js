import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import {
    withKnobs,
} from '@storybook/addon-knobs';
import { Message, Image } from 'semantic-ui-react';
import UtteranceContainer from '../imports/ui/components/stories/common/UtteranceContainer';

const exampleOne = {
    intent: 'I_come_from',
    entities: [
        {
            start: 12,
            end: 17,
            value: 'Paris',
            entity: 'from',
        },
    ],
    text: 'I come from Paris.',
};

const UtteranceContainerWrapped = (props) => {
    const [status, setStatus] = useState(null);
    if (!status) {
        return (
            <UtteranceContainer
                {...props}
                onInputNewUserUtterance={u => setStatus(`New user utterance: ${u}!!`)}
                onInputNewBotResponse={u => setStatus(`New bot response: ${u}!!`)}
                onDelete={() => setStatus('delete !')}
                onAbort={() => setStatus('abort!')}
            />
        );
    }
    return <Message color='violet'><Image src='https://cdn.clipart.email/1bdd4ce92ebd2dd1017d03765e853c16_unicorn-clipart-images-free-download2018_660-800.png' size='small'/>{status}</Message>;
};

storiesOf('UtteranceContainer', module)
    .addDecorator(withKnobs)
    .add('bot w/o value', () => (
        <UtteranceContainerWrapped
            agent='bot'
        />
    ))
    .add('bot w/ value', () => (
        <UtteranceContainerWrapped
            agent='bot'
            value={exampleOne}
        />
    ))
    .add('user w/o value', () => (
        <UtteranceContainerWrapped
            agent='user'
        />
    ))
    .add('user w/ value', () => (
        <UtteranceContainerWrapped
            agent='user'
            value={exampleOne}
        />
    ));
