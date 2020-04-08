import React, { useContext, useMemo } from 'react';
import { Container } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useDrop } from 'react-dnd-cjs';
import AnalyticsCard from './AnalyticsCard';
import conversationLengths from '../../../api/graphql/conversations/queries/conversationLengths.graphql';
import conversationDurations from '../../../api/graphql/conversations/queries/conversationDurations.graphql';
import intentFrequencies from '../../../api/graphql/conversations/queries/intentFrequencies.graphql';
import actionCounts from '../../../api/graphql/conversations/queries/actionCounts.graphql';
import conversationCounts from '../../../api/graphql/conversations/queries/conversationCounts.graphql';
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
        conversationsWithIntent: {
            chartTypeOptions: ['line', 'table'],
            titleDescription: 'Visits: the total number of conversations in a given temporal window. Engagements: of those conversations, those with length one or more.',
            queryParams: {
                temporal: true, envs, queryName: 'conversationCounts', langs,
            },
            query: conversationCounts,
            graphParams: {
                x: 'bucket',
                y: [{ absolute: 'count' }, { absolute: 'hits', relative: 'proportion' }],
                formats: {
                    bucket: v => v.toLocaleDateString(),
                    count: v => `${v} visit${v !== 1 ? 's' : ''}`,
                    hits: v => `${v} conversation${v !== 1 ? 's' : ''}`,
                    proportion: v => `${v}%`,
                },
                displayAbsoluteRelative: true,
                axisTitleY: 'Conversations',
            },
        },
        conversationLengths: {
            chartTypeOptions: ['bar', 'pie', 'table'],
            titleDescription: 'The number of user utterances contained in a conversation.',
            queryParams: {
                envs, queryName: 'conversationLengths', langs,
            },
            query: conversationLengths,
            graphParams: {
                x: 'length',
                y: [{ absolute: 'count', relative: 'frequency' }],
                formats: {
                    length: v => `${v} utterance${v !== 1 ? 's' : ''}`,
                },
                axisTitleX: '# Utterances',
                axisTitleY: 'Conversations',
            },
        },
        intentFrequencies: {
            chartTypeOptions: ['bar', 'pie', 'table'],
            titleDescription: 'The number of user utterances classified as having a given intent.',
            queryParams: {
                envs, queryName: 'intentFrequencies', langs,
            },
            query: intentFrequencies,
            graphParams: {
                x: 'name',
                y: [{ absolute: 'count', relative: 'frequency' }],
                axisTitleY: 'Utterances',
                axisBottom: {
                    tickRotation: -25,
                    format: label => `${label.slice(0, 20)}${label.length > 20 ? '...' : ''}`,
                    legendOffset: 36,
                    legendPosition: 'middle',
                },
            },
        },
        conversationDurations: {
            chartTypeOptions: ['bar', 'pie', 'table'],
            titleDescription: 'The number of seconds elapsed between the first and the last message of a conversation.',
            queryParams: {
                envs, queryName: 'conversationDurations', cutoffs: [30, 60, 90, 120, 180], langs,
            },
            query: conversationDurations,
            graphParams: {
                x: 'duration',
                y: [{ absolute: 'count', relative: 'frequency' }],
                formats: {
                    duration: v => `${v}s`,
                },
                axisTitleX: 'Duration (seconds)',
                axisTitleY: 'Conversations',
            },
        },
        conversationsWithAction: {
            chartTypeOptions: ['line', 'table'],
            titleDescription: 'The number of conversations in which a fallback action was triggered.',
            queryParams: {
                temporal: true, envs, queryName: 'conversationCounts', langs,
            },
            query: conversationCounts,
            graphParams: {
                x: 'bucket',
                y: [{ absolute: 'hits', relative: 'proportion' }],
                formats: {
                    bucket: v => v.toLocaleDateString(),
                    proportion: v => `${v}%`,
                    hits: v => `${v} conversation${v !== 1 ? 's' : ''}`,
                },
                displayAbsoluteRelative: true,
                axisTitleY: 'Conversations',
            },
        },
        actionCounts: {
            chartTypeOptions: ['line', 'table'],
            titleDescription: 'The number of times a fallback action was triggered.',
            queryParams: {
                temporal: true, envs, queryName: 'actionCounts', langs,
            },
            query: actionCounts,
            graphParams: {
                x: 'bucket',
                y: [{ absolute: 'hits', relative: 'proportion' }],
                formats: {
                    bucket: v => v.toLocaleDateString(),
                    proportion: v => `${v}%`,
                    hits: v => `${v} occurence${v !== 1 ? 's' : ''}`,
                },
                displayAbsoluteRelative: true,
                axisTitleY: 'Action occurences',
            },
        },
    };

    // 'columns' key required for tables and CSV export
    Object.keys(cardTypes).forEach((type) => {
        const {
            queryParams: { temporal }, graphParams: {
                x, y, axisTitleX, axisTitleY,
            },
        } = cardTypes[type];
        cardTypes[type].graphParams.columns = [
            { temporal, accessor: x, header: axisTitleX || 'Date' },
            { accessor: y[y.length - 1].absolute, header: axisTitleY },
            { accessor: y[y.length - 1].relative, header: '%' },
        ];
    });
    
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
