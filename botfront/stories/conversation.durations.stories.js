import React from 'react';
import { storiesOf } from '@storybook/react';
import ConversationDurationsBarWidget from '../imports/ui/components/charts/ConversationDurationsBarsWidget';

const data = {
    _30: 15415,
    _30_60: 3724,
    _60_90: 2111,
    _90_120: 1150,
    _120_180: 1187,
    _180_: 1608,
};

storiesOf('Conversation durations', module)
    // .addDecorator(withKnobs)
    // .addDecorator(renderLabel => <Label>{renderLabel()}</Label>)

    .add('Bars', () => (
        <div style={{ height: 500 }}>
            <ConversationDurationsBarWidget
                data={data}
                width={900}
                height={500}
                margin={{
                    top: 40,
                    right: 80,
                    bottom: 80,
                    left: 80,
                }}
            />
        </div>
    ));
