import React from 'react';
import { Container } from 'semantic-ui-react';

import AnalyticsCard from './AnalyticsCard';

function AnalyticsDashboard() {
    return (
        <Container className='analytics-container'>
            <div className='analytics-dashboard'>
                <AnalyticsCard />
                <AnalyticsCard />
                <AnalyticsCard />
                <AnalyticsCard />
            </div>
        </Container>
    );
}

export default AnalyticsDashboard;
