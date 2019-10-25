import React from 'react';
import { Container } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import AnalyticsCard from './AnalyticsCard';
import conversationLengths from '../../../api/graphql/conversations/queries/conversationLengths.graphql';
import conversationDurations from '../../../api/graphql/conversations/queries/conversationDurations.graphql';
import intentFrequencies from '../../../api/graphql/conversations/queries/intentFrequencies.graphql';
import visitCounts from '../../../api/graphql/conversations/queries/visitCounts.graphql';
import fallbackCounts from '../../../api/graphql/conversations/queries/fallbackCounts.graphql';

function AnalyticsDashboard(props) {
    const { projectId, environment } = props;

    const envs = [environment];
    if (environment === 'development') envs.push(null);

    return (
        <Container className='analytics-container'>
            <div className='analytics-dashboard'>
                <AnalyticsCard
                    chartTypeOptions={['bar', 'pie']}
                    title='Conversation Lengths'
                    queryParams={{ projectId, envs, queryName: 'conversationLengths' }}
                    query={conversationLengths}
                    graphParams={{
                        x: 'length',
                        y: [{ abs: 'count', rel: 'frequency' }],
                        suffixes: {
                            length: ' utterances',
                        },
                    }}
                />
                <AnalyticsCard
                    chartTypeOptions={['bar', 'pie']}
                    title='Top 10 Intents'
                    queryParams={{ projectId, envs, queryName: 'intentFrequencies' }}
                    query={intentFrequencies}
                    graphParams={{
                        x: 'name',
                        y: [{ abs: 'count', rel: 'frequency' }],
                        axisBottom: { tickRotation: -25 },
                    }}
                />
                <AnalyticsCard
                    chartTypeOptions={['bar', 'pie']}
                    title='Conversation Durations'
                    queryParams={{ projectId, envs, queryName: 'conversationDurations' }}
                    query={conversationDurations}
                    graphParams={{
                        x: 'duration',
                        y: [{ abs: 'count', rel: 'frequency' }],
                        suffixes: {
                            duration: 's',
                        },
                    }}
                />
                <AnalyticsCard
                    chartTypeOptions={['line']}
                    title='Fallback'
                    queryParams={{
                        temporal: true, envs, projectId, queryName: 'responseCounts',
                    }}
                    query={fallbackCounts}
                    graphParams={{
                        x: 'bucket',
                        y: [{ abs: 'count', rel: 'proportion' }],
                        suffixes: {
                            proportion: '%',
                        },
                        rel: { y: [{ abs: 'proportion' }] },
                    }}
                />
                <AnalyticsCard
                    chartTypeOptions={['line']}
                    title='Visits & Engagement'
                    queryParams={{
                        temporal: true, projectId, envs, queryName: 'conversationCounts',
                    }}
                    query={visitCounts}
                    graphParams={{
                        x: 'bucket',
                        y: [{ abs: 'count' }, { abs: 'engagements', rel: 'proportion' }],
                        suffixes: {
                            count: ' visits',
                            engagements: ' engagements',
                            proportion: '%',
                        },
                        rel: { y: [{ abs: 'proportion' }] },
                    }}
                />
            </div>
        </Container>
    );
}

AnalyticsDashboard.propTypes = {
    projectId: PropTypes.string.isRequired,
    environment: PropTypes.string.isRequired,
};

AnalyticsDashboard.defaultProps = {};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    environment: state.settings.get('workingDeploymentEnvironment'),
});

export default connect(mapStateToProps)(AnalyticsDashboard);
