import React from 'react';
import { storiesOf } from '@storybook/react';
import EntityDistributionWidget from '../imports/ui/components/charts/EntityDistributionWidget';

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
        <div style={{ width: 500, height: 500 }}>
            <EntityDistributionWidget
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
            />
        </div>
    ));
