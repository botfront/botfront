import React from 'react';
import { storiesOf } from '@storybook/react';
import {
    withKnobs, array, boolean, text,
} from '@storybook/addon-knobs';

import AnalyticsCard from '../../imports/ui/components/analytics/AnalyticsCard';

storiesOf('AnalyticsCard', module)
    .addDecorator(withKnobs)
    .add('Card', () => (
        <AnalyticsCard
            displayDateRange={boolean('displayDateRange', true)}
            chartTypeOptions={array('charTypeOptions', ['bar', 'line'])}
            title={text('title', 'Engagement rate')}
            displayAbsoluteRelative={boolean('displayAbsoluteRelative', true)}
            titleDescription={text('title description', 'A title description')}
        />
    ));
