import React from 'react';
import { Container } from 'semantic-ui-react';

import AnalyticsCard from './AnalyticsCard';

function AnalyticsDashboard() {
    return (
        <Container className='analytics-container'>
            <div className='analytics-dashboard'>
                {/* <AnalyticsCard
                    dataFetchPromise={
                        (start, end) => {
                            return new Promise((resolve, reject) => {
                                fetchSomeData(start, end, () => resolve);
                            });
                        }
                    }
                    render={(dataObject) => {
                        if (dataObject.chartType === 'line') {
                            return <LineChart data={dataObject.dataLoaded} />
                        }
                    }}
                    chartTypeOptions={['line', 'bar']}
                    title={'phil'}
                /> */}
                <AnalyticsCard />
                <AnalyticsCard />
                <AnalyticsCard />
            </div>
        </Container>
    );
}

export default AnalyticsDashboard;
