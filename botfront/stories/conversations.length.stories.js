import React from 'react';
import { storiesOf } from '@storybook/react';
import ConversationsLengthWidget from '../imports/ui/components/charts/ConversationsLengthPieWidget';
import ConversationsLengthBarWidget from '../imports/ui/components/charts/ConversationsLengthBarsWidget';

const data = [
    { length: 1, frequency: 0.5412474849094567, count: 269 },
    { length: 4, frequency: 0.13480885311871227, count: 67 },
    { length: 5, frequency: 0.096579476861167, count: 48 },
    { length: 3, frequency: 0.08249496981891348, count: 41 },
    { length: 2, frequency: 0.060362173038229376, count: 30 },
    { length: 6, frequency: 0.03420523138832998, count: 17 },
    { length: 7, frequency: 0.030181086519114688, count: 15 },
    { length: 8, frequency: 0.01006036217303823, count: 5 },
    { length: 9, frequency: 0.004024144869215292, count: 2 },
    { length: 10, frequency: 0.002012072434607646, count: 1 },
    { length: 11, frequency: 0.002012072434607646, count: 1 },
    { length: 13, frequency: 0.002012072434607646, count: 1 },
];
storiesOf('Conversations length', module)
    // .addDecorator(withKnobs)
    // .addDecorator(renderLabel => <Label>{renderLabel()}</Label>)
    .add('Pie', () => (
        <div style={{ width: 500, height: 500 }}>
            <ConversationsLengthWidget
                data={data.map(({ length, count, frequency }) => ({
                    id: length,
                    label: `length: ${length}`,
                    strValue: `${(frequency * 100).toFixed(2)}% (${count})`,
                    value: (frequency * 100).toFixed(2),
                }))}
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
    ))
    .add('Bars', () => (
        <div style={{ width: 500, height: 500 }}>
            <ConversationsLengthBarWidget
                data={data.map(({ length, count, frequency }) => ({
                    count,
                    length,
                }))}
                keys={['count']}
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
;
