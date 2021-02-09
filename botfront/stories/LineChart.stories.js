import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select } from '@storybook/addon-knobs';
import LineChart from '../imports/ui/components/charts/LineChart';
import { dataPresets } from './PieChart.stories';

storiesOf('LineChart', module)
    .addDecorator(withKnobs)
    .add('default', () => (
        <div style={{ height: '80vh' }}>
            <LineChart
                {...select('data', dataPresets, dataPresets.intentFrequencies)}
            />
        </div>
    ));
