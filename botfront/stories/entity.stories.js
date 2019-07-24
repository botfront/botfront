import React from 'react';
import { storiesOf } from '@storybook/react';
import { Label } from 'semantic-ui-react';
import { withKnobs, boolean, select } from '@storybook/addon-knobs';
import { ConversationOptionsContext } from '../imports/ui/components/utils/Context';
import Entity from '../imports/ui/components/utils/EntityLabel';

storiesOf('Entity', module)
    .addDecorator(withKnobs)
    .addDecorator(story => (
        <ConversationOptionsContext.Provider
            value={{
                entities: ['entity1', 'entity4'],
            }}
        >
            {story()}
        </ConversationOptionsContext.Provider>
    ))
    .addDecorator(renderLabel => <Label>{renderLabel()}</Label>)
    .add('with props', () => (
        <div>
            Some random text
            <Entity
                value={{
                    start: 16,
                    end: 20,
                    value: 'text',
                    entity: 'entity4',
                }}
                size={select('size', ['mini', 'tiny'], 'mini')}
                allowEditing={boolean('allowEditing', false)}
                deletable={boolean('deletable', false)}
            />
            Some more randdom text
        </div>
    ));
