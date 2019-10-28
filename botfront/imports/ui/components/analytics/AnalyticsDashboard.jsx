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
                    title='Conversation Length'
                    titleDescription='The number of user utterances contained in a conversation.'
                    queryParams={{ projectId, envs, queryName: 'conversationLengths' }}
                    query={conversationLengths}
                    graphParams={{
                        x: 'length',
                        y: [{ abs: 'count', rel: 'frequency' }],
                        formats: {
                            length: v => `${v} utterances`,
                        },
                    }}
                />
                <AnalyticsCard
                    chartTypeOptions={['bar', 'pie']}
                    title='Top 10 Intents'
                    titleDescription='The number of user utterances classified as having a given intent.'
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
                    title='Conversation Duration'
                    titleDescription='The number of seconds elapsed between the first and the last message of a conversation.'
                    queryParams={{ projectId, envs, queryName: 'conversationDurations' }}
                    query={conversationDurations}
                    graphParams={{
                        x: 'duration',
                        y: [{ abs: 'count', rel: 'frequency' }],
                        formats: {
                            duration: v => `${v}s`,
                        },
                    }}
                />
                <AnalyticsCard
                    chartTypeOptions={['line']}
                    title='Fallback'
                    titleDescription='The number of times the bot uttered fallback (out of all bot utterances).'
                    queryParams={{
                        temporal: true, envs, projectId, queryName: 'responseCounts',
                    }}
                    query={fallbackCounts}
                    graphParams={{
                        x: 'bucket',
                        y: [{ abs: 'count', rel: 'proportion' }],
                        formats: {
                            bucket: v => v.toLocaleDateString(),
                            proportion: v => `${v}%`,
                        },
                        rel: { y: [{ abs: 'proportion' }] },
                    }}
                />
                <AnalyticsCard
                    chartTypeOptions={['line']}
                    title='Visits & Engagement'
                    titleDescription='Visits: the total number of conversations in a given temporal window. Engagements: of those conversations, those with length one or more.'
                    queryParams={{
                        temporal: true, projectId, envs, queryName: 'conversationCounts',
                    }}
                    query={visitCounts}
                    graphParams={{
                        x: 'bucket',
                        y: [{ abs: 'count' }, { abs: 'engagements', rel: 'proportion' }],
                        formats: {
                            bucket: v => v.toLocaleDateString(),
                            count: v => `${v} visits`,
                            engagements: v => `${v} engagements`,
                            proportion: v => `${v}%`,
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
