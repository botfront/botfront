import React from 'react';
import { storiesOf } from '@storybook/react';
import { Label } from 'semantic-ui-react';
import { withKnobs, boolean, select } from '@storybook/addon-knobs';
import Intent from '../imports/ui/components/utils/IntentLabel';
import { ConversationOptionsContext } from '../imports/ui/components/utils/Context';

storiesOf('Intent', module)
    .addDecorator(withKnobs)
    .addDecorator(story => (
        <ConversationOptionsContext.Provider
            value={{
                intents: ['Intent 1', 'Intent 2', 'Intent 3'],
            }}
        >
            {story()}
        </ConversationOptionsContext.Provider>
    ))
    .addDecorator(renderLabel => <Label>{renderLabel()}</Label>)
    .add('with props', () => (
        <div>
            Some random text
            <Intent
                value='Intent 1'
                size={select(
                    'size',
                    ['mini', 'tiny'],
                    'mini',
                )}
                allowEditing={boolean('allowEditing', false)}
                allowAdditions={boolean('allowAdditions', false)}
            />
        </div>
    ));
