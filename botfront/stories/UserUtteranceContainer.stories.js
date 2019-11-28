import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import {
    withKnobs, select,
} from '@storybook/addon-knobs';
import { Message, Image } from 'semantic-ui-react';
import UserUtteranceContainer from '../imports/ui/components/stories/common/UserUtteranceContainer';

const utteranceOne = {
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

const utteranceTwo = {
    intent: 'I_want_peanuts_on_my_sundae',
    entities: [
        {
            start: 7,
            end: 14,
            value: 'peanuts',
            entity: 'food',
        },
        {
            start: 43,
            end: 50,
            value: 'peanuts',
            entity: 'food',
        },
    ],
    text: 'I love peanuts all night long. Do you love peanuts as much as me? Ok ?',
};

const utteranceThree = {
    intent: 'Im_summarizing_Moby_Dick',
    entities: [],
    text: `On the first day of the chase, Ahab smells the whale, climbs the mast, and sights Moby Dick. He claims the doubloon for himself, and orders all
boats to lower except for Starbuck's. The whale bites Ahab's boat in two, tosses the captain out of it, and scatters the crew. On the second day of the chase,
Ahab leaves Starbuck in charge of the Pequod. Moby Dick smashes the three boats that seek him into splinters and tangles their lines. Ahab is rescued, but his ivory leg and Fedallah are lost.
Starbuck begs Ahab to desist, but Ahab vows to slay the white whale, even if he would have to dive through the globe itself to get his revenge.`,
};

export const utterances = { utteranceOne, utteranceTwo, utteranceThree };

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

storiesOf('UserUtteranceContainer', module)
    .addDecorator(withKnobs)
    .add('w/o value', () => (
        <UserUtteranceContainerWrapped />
    ))
    .add('w/ value', () => (
        <UserUtteranceContainerWrapped
            value={select('utterance', utterances, utterances.utteranceOne)}
        />
    ));
