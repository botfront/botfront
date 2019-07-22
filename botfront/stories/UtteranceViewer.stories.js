import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { Label } from 'semantic-ui-react';
import { withKnobs, boolean, select } from '@storybook/addon-knobs';
import UserUtteranceViewer from '../imports/ui/components/utils/UserUtteranceViewer';
import { ConversationOptionsContext } from '../imports/ui/components/utils/Context';

function UserUtteranceViewerWrapped(props) {
    const [utterance, setUtterance] = useState({
        text: 'This is an intent that is an entity',
        intent: 'intent',
        entities: [
            {
                start: 0,
                end: 4,
                value: 'This',
                entity: 'entity1',
            },
            {
                start: 8,
                end: 10,
                value: 'an',
                entity: 'entity2',
            },
            {
                start: 11,
                end: 17,
                value: 'intent',
                entity: 'entity2',
            },
            {
                start: 26,
                end: 28,
                value: 'an',
                entity: 'entity2',
            },
            {
                start: 29,
                end: 35,
                value: 'entity',
                entity: 'entity2',
            },
        ],
    });
    return (
        <UserUtteranceViewer {...props} value={utterance} onChange={setUtterance} />
    );
}

storiesOf('UserUtteranceViewer', module)
    .addDecorator(withKnobs)
    .addDecorator(story => (
        <ConversationOptionsContext.Provider
            value={{
                intents: ['Intent 1', 'Intent 2', 'Intent 3'],
                entities: [
                    {
                        start: 9,
                        end: 15,
                        value: 'This',
                        entity: 'entity1',
                    },
                    {
                        start: 16,
                        end: 20,
                        value: 'entity',
                        entity: 'entity4',
                    },
                ],
            }}
        >
            {story()}
        </ConversationOptionsContext.Provider>
    ))
    .addDecorator(renderLabel => <Label>{renderLabel()}</Label>)
    .add('with props', () => (
        <UserUtteranceViewerWrapped
            size={select(
                'size',
                ['mini', 'tiny'],
                'mini',
            )}
            allowEditing={boolean('allowEditing', true)}
        />
    ));
