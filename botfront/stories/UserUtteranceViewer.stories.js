import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { withBackground } from '../.storybook/decorators';
import UserUtteranceViewer from '../imports/ui/components/nlu/common/UserUtteranceViewer';

function UserUtteranceViewerWrapped(props) {
    const [utterance, setUtterance] = useState({
        text: 'I like blue beans with red sauce.',
        intent: 'I_like_beans',
        entities: [
            {
                start: 7,
                end: 11,
                value: 'blue',
                entity: 'bean-color',
            },
            {
                start: 23,
                end: 26,
                value: 'red',
                entity: 'sauce-color',
            },
        ],
    });
    return (
        <div
            style={{ width: '100%', backgroundColor: '#eee', padding: '20px' }}
        >
            <UserUtteranceViewer {...props} value={utterance} onChange={setUtterance} />
        </div>
    );
}

storiesOf('UserUtteranceViewer', module)
    .addDecorator(withKnobs)
    .addDecorator(withBackground)
    .add('with props', () => (
        <UserUtteranceViewerWrapped
            disableEditing={boolean('disableEditing', false)}
            showIntent={boolean('showIntent', true)}
            disabled={boolean('disabled', false)}
        />
    ));
