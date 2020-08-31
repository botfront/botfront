import React, { useState } from 'react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { Button, Icon } from 'semantic-ui-react';
import { withBackground } from '../../.storybook/decorators';
import EntityLabel from '../../imports/ui/components/nlu/common/EntityLabel';

function EntityLabelWrapped(props) {
    const [entity, setEntity] = useState({ entity: 'color', value: 'red' });
    if (!entity) return <Icon color='red' name='american sign language interpreting' size='huge' />;
    return (
        <EntityLabel
            value={entity}
            onChange={value => setEntity({ ...entity, entity: value })}
            onDelete={() => setEntity(null)}
            {...props}
        />
    );
}

export default {
    title: 'StoryLabels/EntityLabel',
    component: EntityLabel,
    decorators: [withKnobs, withBackground],
};

export const Basic = () => (
    <EntityLabelWrapped
        allowEditing={boolean('allowEditing', true)}
        deletable={boolean('deletable', true)}
    />
);

export const WithCustomTrigger = () => (
    <EntityLabelWrapped
        allowEditing={boolean('allowEditing', true)}
        deletable={boolean('deletable', true)}
        customTrigger={<Button color='red' content='click to change entity' basic />}
    />
);
