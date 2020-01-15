import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text } from '@storybook/addon-knobs';
import { Segment } from 'semantic-ui-react';
import StoryTriggersForm from '../imports/ui/components/chat_rules/StoryTriggersForm';

const storyTriggers = [];

const StoryTriggersWrapper = (props) => {
    const [data, setData] = useState([storyTriggers]);
    return (
        <div style={{ position: 'absolute', margin: '0px', top: '50px' }}>
            <Segment>
                <StoryTriggersForm
                    onChange={(updatedRules) => {
                        setData([updatedRules]);
                    }}
                    rules={data}
                />
            </Segment>
        </div>
    );
};

storiesOf('StoryTriggersForm', module)
    .add('default', () => <StoryTriggersWrapper />);
