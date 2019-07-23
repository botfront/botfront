import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import {
    withKnobs,
} from '@storybook/addon-knobs';
import { Message, Image } from 'semantic-ui-react';
import UserUtteranceContainer from '../imports/ui/components/stories/common/UserUtteranceContainer';

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
    text: `I come from Paris. Lorem ipsum dolor sit amet, consectetur adipiscing elit,
sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
};

const UserUtteranceContainerWrapped = (props) => {
    const [status, setStatus] = useState(null);
    const { value: initValue, ...rest } = props;
    const [value, setValue] = useState(initValue);
    if (!status) {
        return (
            <div className='story-visual-editor'>
                <UserUtteranceContainer
                    {...rest}
                    onInput={u => setStatus(`New user utterance: ${u}!!`)}
                    onChange={v => setValue(v)}
                    onSave={() => setStatus(`Edited!: ${value.text}`)}
                    onDelete={() => setStatus('delete !')}
                    onAbort={() => setStatus('abort!')}
                    value={value}
                />
            </div>
        );
    }
    return (
        <Message color='violet' style={{ width: '250px' }}>
            <Image src='https://cdn.clipart.email/1bdd4ce92ebd2dd1017d03765e853c16_unicorn-clipart-images-free-download2018_660-800.png' size='small' />
            {status}
        </Message>
    );
};

storiesOf('UtteranceContainer', module)
    .addDecorator(withKnobs)
    .add('w/o value', () => (
        <UserUtteranceContainerWrapped />
    ))
    .add('w/ value', () => (
        <UserUtteranceContainerWrapped
            value={exampleOne}
        />
    ));
