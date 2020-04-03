import React, { useContext, useMemo } from 'react';
import { Container } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useDrop } from 'react-dnd-cjs';
import AnalyticsCard from './AnalyticsCard';
import conversationLengths from '../../../api/graphql/conversations/queries/conversationLengths.graphql';
import conversationDurations from '../../../api/graphql/conversations/queries/conversationDurations.graphql';
import intentFrequencies from '../../../api/graphql/conversations/queries/intentFrequencies.graphql';
import visitCounts from '../../../api/graphql/conversations/queries/visitCounts.graphql';
import fallbackCounts from '../../../api/graphql/conversations/queries/fallbackCounts.graphql';
import conversationsWithFallback from '../../../api/graphql/conversations/queries/conversationsWithFallback.graphql';
import { ProjectContext } from '../../layouts/context';
import { setsAreIdentical } from '../../../lib/utils';

function AnalyticsDashboard({ dashboard, onUpdateDashboard }) {
    const {
        cards,
        languages,
        envs,
    } = dashboard;

    const { projectLanguages } = useContext(ProjectContext);

    const langs = useMemo(() => (setsAreIdentical(languages, projectLanguages.map(l => l.value))
        ? [] : languages), [languages]); // empty array if all languages are selected

    const cardTypes = {
        visitCounts: {
            chartTypeOptions: ['line', 'table'],
            title: 'Visits & Engagement',
            titleDescription: 'Visits: the total number of conversations in a given temporal window. Engagements: of those conversations, those with length one or more.',
            queryParams: {
                temporal: true, envs, queryName: 'conversationCounts', langs,
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
                    { header: 'Engagements', accessor: 'hits' },
                    { header: 'Engagement Ratio', accessor: 'proportion' },
                ],
                axisTitleY: { default: 'Visitor Engagement' },
                axisTitleX: { day: 'Date', hour: 'Time', week: 'Week' },
                unitY: { relative: '%' },
                axisLeft: { legendOffset: -46, legendPosition: 'middle' },
                axisBottom: { legendOffset: 36, legendPosition: 'middle' },
            },
        },
        conversationLengths: {
            chartTypeOptions: ['bar', 'pie', 'table'],
            title: 'Conversation Length',
            titleDescription: 'The number of user utterances contained in a conversation.',
            queryParams: {
                envs, queryName: 'conversationLengths', langs,
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
                axisTitleX: { absolute: 'User Utterances' },
                axisTitleY: { absolute: 'Number of Conversations' },
                axisLeft: { legendOffset: -46, legendPosition: 'middle' },
                axisBottom: { legendOffset: 36, legendPosition: 'middle' },
            },
        },
        intentFrequencies: {
            chartTypeOptions: ['bar', 'pie', 'table'],
            title: 'Top 10 Intents',
            titleDescription: 'The number of user utterances classified as having a given intent.',
            queryParams: {
                envs, queryName: 'intentFrequencies', langs,
            },
            exportQueryParams: { limit: 100000 },
            query: intentFrequencies,
            graphParams: {
                x: 'name',
                y: [{ abs: 'count', rel: 'frequency' }],

                columns: [
                    { header: 'Intent Name', accessor: 'name' },
                    { header: 'Count', accessor: 'count' },
                    { header: 'Frequency', accessor: 'frequency' },
                ],
                axisTitleY: { absolute: 'Number of Conversations' },
                axisBottom: {
                    tickRotation: -25,
                    format: label => `${label.slice(0, 20)}${label.length > 20 ? '...' : ''}`,
                    legendOffset: 36,
                    legendPosition: 'middle',
                },
                axisLeft: { legendOffset: -46, legendPosition: 'middle' },
            },
        },
        conversationDurations: {
            chartTypeOptions: ['bar', 'pie', 'table'],
            title: 'Conversation Duration',
            titleDescription: 'The number of seconds elapsed between the first and the last message of a conversation.',
            queryParams: {
                envs, queryName: 'conversationDurations', cutoffs: [30, 60, 90, 120, 180], langs,
            },
            query: conversationDurations,
            graphParams: {
                x: 'duration',
                y: [{ abs: 'count', rel: 'frequency' }],
                formats: {
                    duration: v => `${v}s`,
                },
                columns: [
                    { header: 'Duration (seconds)', accessor: 'duration' },
                    { header: 'Count', accessor: 'count' },
                    { header: 'Frequency', accessor: 'frequency' },
                ],
                axisTitleX: { absolute: 'Duration' },
                axisTitleY: { absolute: 'Number of Conversations' },
                unitX: { default: 'seconds' },
                axisLeft: { legendOffset: -46, legendPosition: 'middle' },
                axisBottom: { legendOffset: 36, legendPosition: 'middle' },
            },
        },
        conversationsWithFallback: {
            chartTypeOptions: ['line', 'table'],
            title: 'Conversations with Fallback',
            titleDescription: 'The number of conversations in which a fallback action was triggered.',
            queryParams: {
                temporal: true, envs, queryName: 'conversationCounts', langs,
            },
            query: conversationsWithFallback,
            graphParams: {
                x: 'bucket',
                y: [{ abs: 'hits', rel: 'proportion' }],
                formats: {
                    bucket: v => v.toLocaleDateString(),
                    proportion: v => `${v}%`,
                },
                columns: [
                    { header: 'Date', accessor: 'bucket', temporal: true },
                    { header: 'Count', accessor: 'hits' },
                    { header: 'Proportion', accessor: 'proportion' },
                ],
                rel: { y: [{ abs: 'proportion' }] },
                axisTitleY: { absolute: 'Number of Fallbacks', relative: 'Fallback Ratio' },
                axisTitleX: { day: 'Date', hour: 'Time', week: 'Week' },
                unitY: { relative: '%' },
                axisLeft: { legendOffset: -46, legendPosition: 'middle' },
                axisBottom: { legendOffset: 36, legendPosition: 'middle' },
            },
        },
        fallbackCounts: {
            chartTypeOptions: ['line', 'table'],
            title: 'Fallback Rate',
            titleDescription: 'The number of times a fallback action was triggered.',
            queryParams: {
                temporal: true, envs, queryName: 'actionCounts', langs,
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
                    { header: 'Count', accessor: 'hits' },
                    { header: 'Proportion', accessor: 'proportion' },
                ],
                rel: { y: [{ abs: 'proportion' }] },
                axisTitleY: { absolute: 'Number of Fallbacks', relative: 'Fallback Ratio' },
                axisTitleX: { day: 'Date', hour: 'Time', week: 'Week' },
                unitY: { relative: '%' },
                axisLeft: { legendOffset: -46, legendPosition: 'middle' },
                axisBottom: { legendOffset: 36, legendPosition: 'middle' },
            },
        },
    };
    
    const [, drop] = useDrop({ accept: 'card' });

    const handleChangeCardSettings = index => update => onUpdateDashboard({
        cards: [
            ...cards.slice(0, index),
            { ...cards[index], ...update },
            ...cards.slice(index + 1),
        ],
    });

    const handleSwapCards = index => (draggedCardName) => {
        const draggedCardIndex = cards.findIndex(c => c.name === draggedCardName);
        const updatedCards = [...cards];
        updatedCards[index] = cards[draggedCardIndex];
        updatedCards[draggedCardIndex] = cards[index];
        onUpdateDashboard({ cards: updatedCards });
    };

    return (
        <div style={{ overflowY: 'auto', height: 'calc(100% - 49px', marginTop: '0' }}>
            <Container>
                <div className='analytics-dashboard' ref={drop}>
                    {cards.map(({
                        name, type, startDate, endDate, ...settings
                    }, index) => (
                        <AnalyticsCard
                            key={name}
                            cardName={name}
                            {...cardTypes[type]}
                            settings={{ ...settings, startDate: moment(startDate), endDate: moment(endDate) }}
                            onChangeSettings={handleChangeCardSettings(index)}
                            onReorder={handleSwapCards(index)}
                        />
                    ))}
                </div>
            </Container>
        </div>
    );
}

AnalyticsDashboard.propTypes = {
    dashboard: PropTypes.object.isRequired,
    onUpdateDashboard: PropTypes.func.isRequired,
};

AnalyticsDashboard.defaultProps = {};

export default AnalyticsDashboard;
