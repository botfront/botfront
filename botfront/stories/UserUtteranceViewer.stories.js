import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { withBackground } from '../.storybook/decorators';
import UserUtteranceViewer from '../imports/ui/components/nlu/common/UserUtteranceViewer';
import { ProjectContext } from '../imports/ui/layouts/context';

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
        <ProjectContext.Provider
            value={{
                intents: ['Intent 1', 'Intent 2', 'Intent 3'],
                entities: ['entity1', 'entity4'],
            }}
        >
            {story()}
        </ProjectContext.Provider>
    ))
    .add('with props', () => (
        <UserUtteranceViewerWrapped
            disableEditing={boolean('disableEditing', false)}
            showIntent={boolean('showIntent', true)}
        />
    ));
