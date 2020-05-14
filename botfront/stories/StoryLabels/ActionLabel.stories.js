import React, { useState } from 'react';
import ActionLabel from '../../imports/ui/components/stories/ActionLabel';

export default {
    title: 'StoryLabels/ActionLabel',
    component: ActionLabel,
};

function ActionLabelWrapped(props) {
    const [defaultAction, setActionName] = useState('Action Name');
    return (
        <ActionLabel
            {...props}
            value={defaultAction}
            onChange={setActionName}
        />
    );
}

export const Basic = () => <ActionLabelWrapped />;
