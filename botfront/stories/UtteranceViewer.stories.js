import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { withBackground } from '../.storybook/decorators';
import UserUtteranceViewer from '../imports/ui/components/utils/UserUtteranceViewer';
import { ConversationOptionsContext } from '../imports/ui/components/utils/Context';

function UserUtteranceViewerWrapped(props) {
    const [utterance, setUtterance] = useState({
        text: 'I like blue beans with red sauce.',
        intent: 'I_like_beans',
        entities: [
            {
                start: 7,
                end: 11,
                value: 'blue',
                entity: 'color',
            },
            {
                start: 23,
                end: 26,
                value: 'red',
                entity: 'color',
            },
        ],
    });
    return (
        <div
            style={{
                width: '50%', backgroundColor: '#eee', padding: '10px', margin: '30px', outline: '1px black solid',
            }}
        >
            <UserUtteranceViewer {...props} value={utterance} onChange={setUtterance} />
        </div>
    );
}

storiesOf('UserUtteranceViewer', module)
    .addDecorator(withKnobs)
    .addDecorator(withBackground)
    .addDecorator(story => (
        <ConversationOptionsContext.Provider
            value={{
                intents: ['Intent 1', 'Intent 2', 'Intent 3'],
                entities: ['entity1', 'entity4'],
            }}
        >
            {story()}
        </ConversationOptionsContext.Provider>
    ))
    .add('with props', () => (
        <UserUtteranceViewerWrapped
            disableEditing={boolean('disableEditing', false)}
        />
    ));
