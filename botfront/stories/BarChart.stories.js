import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select } from '@storybook/addon-knobs';
import BarChart from '../imports/ui/components/charts/BarChart';
import { dataPresets } from './PieChart.stories';

storiesOf('BarChart', module)
    .addDecorator(withKnobs)
    .add('default', () => (
        <div style={{ height: 400 }}>
            <BarChart
                {...select('data', dataPresets, dataPresets.intentFrequencies)}
            />
        </div>
    ));
