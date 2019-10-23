import React from 'react';
import { Container } from 'semantic-ui-react';
import AnalyticsCard from './AnalyticsCard';
import { conversationLengths } from './queries';

function AnalyticsDashboard() {
    return (
        <Container className='analytics-container'>
            <div className='analytics-dashboard'>
                <AnalyticsCard
                    chartTypeOptions={['line', 'bar']}
                    title='Conversation Lengths'
                    variables={{ projectId: 'hNY8NSJyxPMRAaEtd' }}
                    query={conversationLengths}
                    queryName='conversationLengths'
                    graphParams={{ x: 'length', y: [{ abs: 'count', rel: 'frequency' }] }}
                />
            </div>
        </Container>
    );
}

export default AnalyticsDashboard;
