import React from 'react';
import { Container } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { OrderedMap } from 'immutable';
import { useDrop } from 'react-dnd-cjs';
import { setAnalyticsCardSettings, swapAnalyticsCards } from '../../store/actions/actions';
import AnalyticsCard from './AnalyticsCard';
import conversationLengths from '../../../api/graphql/conversations/queries/conversationLengths.graphql';
import conversationDurations from '../../../api/graphql/conversations/queries/conversationDurations.graphql';
import intentFrequencies from '../../../api/graphql/conversations/queries/intentFrequencies.graphql';
import visitCounts from '../../../api/graphql/conversations/queries/visitCounts.graphql';
import fallbackCounts from '../../../api/graphql/conversations/queries/fallbackCounts.graphql';

function AnalyticsDashboard(props) {
    const {
        projectId, environment, cardSettings, changeCardSettings, swapCards,
    } = props;

    const envs = [environment];
    if (environment === 'development') envs.push(null);

    const cards = {
        conversationLengths: {
            chartTypeOptions: ['bar', 'pie', 'table'],
            title: 'Conversation Length',
            titleDescription: 'The number of user utterances contained in a conversation.',
            queryParams: {
                projectId, envs, queryName: 'conversationLengths',
            },
            exportQueryParams: { limit: 100000 },
            query: conversationLengths,
            graphParams: {
                x: 'length',
                y: [{ abs: 'count', rel: 'frequency' }],
                formats: {
                    length: v => `${v} utterance${v !== 1 ? 's' : ''}`,
                },
                columns: [
                    { header: 'Length in Utterances', accessor: 'length' },
                    { header: 'Count', accessor: 'count' },
                    { header: 'Frequency', accessor: 'frequency' },
                ],
                axisBottom: { legend: 'Length in Utterances', legendOffset: 36, legendPosition: 'middle' },
                axisLeft: { legend: 'Number of Conversations', legendOffset: -46, legendPosition: 'middle' },
            },
        },
        intentFrequencies: {
            chartTypeOptions: ['bar', 'pie', 'table'],
            title: 'Top 10 Intents',
            titleDescription: 'The number of user utterances classified as having a given intent.',
            queryParams: {
                projectId, envs, queryName: 'intentFrequencies',
            },
            exportQueryParams: { limit: 100000 },
            query: intentFrequencies,
            graphParams: {
                x: 'name',
                y: [{ abs: 'count', rel: 'frequency' }],
                axisBottom: {
                    tickRotation: -25,
                    format: label => `${label.slice(0, 20)}${label.length > 20 ? '...' : ''}`,
                },
                axisLeft: { legend: 'Number of Occurances', legendOffset: -46, legendPosition: 'middle' },
                columns: [
                    { header: 'Name', accessor: 'name' },
                    { header: 'Count', accessor: 'count' },
                    { header: 'Frequency', accessor: 'frequency' },
                ],
            },
        },
        conversationDurations: {
            chartTypeOptions: ['bar', 'pie', 'table'],
            title: 'Conversation Duration',
            titleDescription: 'The number of seconds elapsed between the first and the last message of a conversation.',
            queryParams: {
                projectId, envs, queryName: 'conversationDurations', cutoffs: [30, 60, 90, 120, 180],
            },
            query: conversationDurations,
            graphParams: {
                x: 'duration',
                y: [{ abs: 'count', rel: 'frequency' }],
                // formats: {
                //     duration: v => `${v}s`,
                // },
                columns: [
                    { header: 'Duration (seconds)', accessor: 'duration' },
                    { header: 'Count', accessor: 'count' },
                    { header: 'Frequency', accessor: 'frequency' },
                ],
                axisBottom: { legend: 'Duration (seconds)', legendOffset: 36, legendPosition: 'middle' },
                axisLeft: { legend: 'Number of Conversations', legendOffset: -46, legendPosition: 'middle' },
            },
        },
        fallbackCounts: {
            chartTypeOptions: ['line', 'table'],
            title: 'Fallback',
            titleDescription: 'The number of conversations in which a fallback action was triggered.',
            queryParams: {
                temporal: true, envs, projectId, queryName: 'conversationCounts',
            },
            query: fallbackCounts,
            graphParams: {
                x: 'bucket',
                y: [{ abs: 'hits', rel: 'proportion' }],
                formats: {
                    bucket: v => v.toLocaleDateString(),
                    proportion: v => `${v}%`,
                },
                columns: [
                    { header: 'Date', accessor: 'bucket', temporal: true },
                    { header: 'Hits', accessor: 'hits' },
                    { header: 'Proportion', accessor: 'proportion' },
                ],
                rel: { y: [{ abs: 'proportion' }] },
                axisLeft: { legend: 'Fallbacks', legendOffset: -46, legendPosition: 'middle' },
            },
        },
        visitCounts: {
            chartTypeOptions: ['line', 'table'],
            title: 'Visits & Engagement',
            titleDescription: 'Visits: the total number of conversations in a given temporal window. Engagements: of those conversations, those with length one or more.',
            queryParams: {
                temporal: true, projectId, envs, queryName: 'conversationCounts',
            },
            query: visitCounts,
            graphParams: {
                x: 'bucket',
                y: [{ abs: 'count' }, { abs: 'hits', rel: 'proportion' }],
                formats: {
                    bucket: v => v.toLocaleDateString(),
                    count: v => `${v} visit${v !== 1 ? 's' : ''}`,
                    engagements: v => `${v} engagement${v !== 1 ? 's' : ''}`,
                    proportion: v => `${v}%`,
                },
                rel: { y: [{ abs: 'proportion' }] },
                columns: [
                    { header: 'Date', accessor: 'bucket', temporal: true },
                    { header: 'Visits', accessor: 'count' },
                    { header: 'Hits', accessor: 'hits' },
                    { header: 'Engagement', accessor: 'proportion' },
                ],
                axisLeft: { legend: 'Engagement Comparison', legendOffset: -46, legendPosition: 'middle' },
            },
        },
    };
    
    const [, drop] = useDrop({ accept: 'card' });

    return (
        <Container className='analytics-container'>
            <div className='analytics-dashboard' ref={drop}>
                {cardSettings.entrySeq().map(([cardName, settings]) => (
                    <AnalyticsCard
                        key={cardName}
                        cardName={cardName}
                        {...cards[cardName]}
                        settings={settings.toJS()}
                        onChangeSettings={(setting, value) => changeCardSettings(cardName, setting, value)}
                        onReorder={swapCards}
                    />
                ))}
            </div>
        </Container>
    );
}

AnalyticsDashboard.propTypes = {
    projectId: PropTypes.string.isRequired,
    environment: PropTypes.string.isRequired,
    cardSettings: PropTypes.instanceOf(OrderedMap).isRequired,
    changeCardSettings: PropTypes.func.isRequired,
    swapCards: PropTypes.func.isRequired,
};

AnalyticsDashboard.defaultProps = {};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    environment: state.settings.get('workingDeploymentEnvironment'),
    cardSettings: state.analytics.get('cardSettings'),
});

const mapDispatchToProps = {
    changeCardSettings: setAnalyticsCardSettings,
    swapCards: swapAnalyticsCards,
};

export default connect(mapStateToProps, mapDispatchToProps)(AnalyticsDashboard);
