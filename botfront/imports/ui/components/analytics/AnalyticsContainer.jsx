import React from 'react';

import { PageMenu } from '../utils/Utils';

const Dashboard = React.lazy(() => import('./AnalyticsDashboard'));

function AnalyticsContainer() {
    return (
        <>
            <PageMenu title='Analytics' icon='chart bar' className='analytics-top-menu' />
            <React.Suspense fallback={<div className='analytics-dashboard' />}>
                <Dashboard />
            </React.Suspense>
        </>
    );
}

export default AnalyticsContainer;
