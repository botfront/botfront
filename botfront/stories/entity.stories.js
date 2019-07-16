import React from 'react';
import { storiesOf } from '@storybook/react';
import {
    Label,
} from 'semantic-ui-react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { EntityContext } from '../imports/ui/components/utils/Context';
import Entity from '../imports/ui/components/utils/Entity';

storiesOf('Entity', module)
    .addDecorator(withKnobs)
    .addDecorator(story => (
        <EntityContext.Provider value={{ options: ['entity1', 'entity2entity2entity2'] }}>
            {story()}
        </EntityContext.Provider>
    ))
    .addDecorator(renderLabel => <Label>Please enter a value {renderLabel()}</Label>)
    .add('with props', () => <Entity value={{ value: 'text1', entity: 'entity3' }} size='mini' allowAdditions={boolean('allowAdditions', false)} allowEditing={boolean('allowEditing', false)} />);
