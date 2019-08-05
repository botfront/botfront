import React from 'react';
import { storiesOf } from '@storybook/react';
import { Pie } from '@nivo/pie';

const data = [
    { count: 523, entity: 'CompositeLocation' },
    { count: 270, entity: 'CompositePlace' },
    { count: 176, entity: 'Brand' },
    { count: 132, entity: 'room_type' },
    { count: 124, entity: 'Services' },
    { count: 118, entity: 'rooms_count' },
    { count: 112, entity: 'FullNameHotel' },
    { count: 83, entity: 'CompositeActions' },
    { count: 78, entity: 'guests_count' },
    { count: 67, entity: 'CompositeInspiration' },
    { count: 59, entity: 'Positioning' },
    { count: 54, entity: 'adults_count' },
    { count: 41, entity: 'nights_count' },
    { count: 27, entity: 'kids_count' },
];

storiesOf('Entities distrubution', module)
    // .addDecorator(withKnobs)
    // .addDecorator(renderLabel => <Label>{renderLabel()}</Label>)
    .add('with props', () => (
        <div>
            <Pie
                data={data.map(({ entity, count }) => ({
                    id: entity,
                    label: entity,
                    value: count,
                }))}
                width={900}
                height={500}
                margin={{
                    top: 40,
                    right: 80,
                    bottom: 80,
                    left: 80,
                }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                colors={{ scheme: 'nivo' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                radialLabelsSkipAngle={10}
                radialLabelsTextXOffset={6}
                radialLabelsTextColor='#333333'
                radialLabelsLinkOffset={0}
                radialLabelsLinkDiagonalLength={16}
                radialLabelsLinkHorizontalLength={24}
                radialLabelsLinkStrokeWidth={1}
                radialLabelsLinkColor={{ from: 'color' }}
                slicesLabelsSkipAngle={10}
                slicesLabelsTextColor='#333333'
                animate
                motionStiffness={90}
                motionDamping={15}
                defs={[
                    {
                        id: 'dots',
                        type: 'patternDots',
                        background: 'inherit',
                        color: 'rgba(255, 255, 255, 0.3)',
                        size: 4,
                        padding: 1,
                        stagger: true,
                    },
                    {
                        id: 'lines',
                        type: 'patternLines',
                        background: 'inherit',
                        color: 'rgba(255, 255, 255, 0.3)',
                        rotation: -45,
                        lineWidth: 6,
                        spacing: 10,
                    },
                ]}
            />
        </div>
    ));
