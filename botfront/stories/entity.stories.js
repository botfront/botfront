import React from 'react';
import { storiesOf } from '@storybook/react';
import {
    Label,
} from 'semantic-ui-react';
import Entity from '../imports/ui/components/utils/Entity';

storiesOf('Entity', module)
    .addDecorator(renderLabel => <Label>Please enter a value {renderLabel()}</Label>)
    .add('with value', () => (
        <Entity value={{ entity: 'text1', value: 'entity3' }} options={['entity1', 'entity2entity2entity2']} size='mini' allowAdditions allowEditing />
    ));
