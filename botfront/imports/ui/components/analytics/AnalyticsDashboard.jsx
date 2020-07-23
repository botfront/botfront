import React, { useContext, useMemo } from 'react';
import { Container } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useDrop } from 'react-dnd-cjs';
import { useApolloClient } from '@apollo/react-hooks';
import AnalyticsCard from './AnalyticsCard';
import conversationLengths from '../../../api/graphql/conversations/queries/conversationLengths.graphql';
import conversationDurations from '../../../api/graphql/conversations/queries/conversationDurations.graphql';
import intentFrequencies from '../../../api/graphql/conversations/queries/intentFrequencies.graphql';
import actionCounts from '../../../api/graphql/conversations/queries/actionCounts.graphql';
import conversationCounts from '../../../api/graphql/conversations/queries/conversationCounts.graphql';
import conversationsFunnel from '../../../api/graphql/conversations/queries/conversationsFunnel.graphql';
import { ProjectContext } from '../../layouts/context';
import { setsAreIdentical, findName } from '../../../lib/utils';
import {
    calculateTemporalBuckets, applyTimezoneOffset, generateXLSX, downloadXLSX,
} from '../../../lib/graphs';
import { clearTypenameField } from '../../../lib/client.safe.utils';


function AnalyticsDashboard({ dashboard, onUpdateDashboard }) {
    const {
        cards,
        languages,
        envs,
    } = dashboard;

    const { projectLanguages } = useContext(ProjectContext);
    const apolloClient = useApolloClient();

    const {
        project: {
            _id: projectId, timezoneOffset: projectTimezoneOffset = 0,
        },
    } = useContext(ProjectContext);
    const langs = useMemo(() => (setsAreIdentical(languages, projectLanguages.map(l => l.value))
        ? [] : languages), [languages]); // empty array if all languages are selected

    const cardTypes = {
        conversationLengths: {
            chartTypeOptions: ['bar', 'pie', 'table'],
            titleDescription: 'The number of conversations that contain a given number of user utterances.',
            queryParams: {
                envs, queryName: 'conversationLengths', langs,
            },
            query: conversationLengths,
            graphParams: {
                x: 'length',
                y: { absolute: 'count', relative: 'frequency' },
                formats: {
                    length: v => `${v} utterance${v !== 1 ? 's' : ''}`,
                },
                axisTitleX: '# Utterances',
                axisTitleY: 'Conversations',
            },
        },
        conversationDurations: {
            chartTypeOptions: ['bar', 'pie', 'table'],
            titleDescription: 'The number of conversations with a given number of seconds elapsed between the first and last message.',
            queryParams: {
                envs, queryName: 'conversationDurations', cutoffs: [30, 60, 90, 120, 180], langs,
            },
            query: conversationDurations,
            graphParams: {
                x: 'duration',
                y: { absolute: 'count', relative: 'frequency' },
                formats: {
                    duration: v => `${v}s`,
                },
                axisTitleX: 'Duration (seconds)',
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
                y: { absolute: 'count', relative: 'frequency' },
                axisTitleY: 'Utterances',
                axisTitleX: 'Intent',
                noXLegend: true,
                axisBottom: {
                    tickRotation: -25,
                    format: label => `${label.slice(0, 20)}${label.length > 20 ? '...' : ''}`,
                    legendOffset: 36,
                    legendPosition: 'middle',
                },
                displayConfigs: ['includeIntents', 'excludeIntents'],
            },
        },
        conversationCounts: {
            chartTypeOptions: ['line', 'bar', 'table'],
            titleDescription: 'Out of the visits (total number of conversations) in a given temporal window, the conversations that satisfy filters.',
            queryParams: {
                temporal: true, envs, queryName: 'conversationCounts', langs,
            },
            query: conversationCounts,
            graphParams: {
                x: 'bucket',
                y: { absolute: 'hits', relative: 'proportion' },
                y2: { absolute: 'count' },
                formats: {
                    bucket: v => v.toLocaleDateString(),
                    count: v => `${v} visit${v !== 1 ? 's' : ''}`,
                    hits: v => `${v} conversation${v !== 1 ? 's' : ''}`,
                    proportion: v => `${v}%`,
                },
                displayAbsoluteRelative: true,
                axisTitleY: 'Conversations',
                displayConfigs: ['includeIntents', 'excludeIntents', 'includeActions', 'excludeActions'],
            },
        },
        actionCounts: {
            chartTypeOptions: ['line', 'bar', 'table'],
            titleDescription: 'Out of all conversational events in a given temporal window, the number of actions occurrences that satisfy filters.',
            queryParams: {
                temporal: true, envs, queryName: 'actionCounts', langs,
            },
            query: actionCounts,
            graphParams: {
                x: 'bucket',
                y: { absolute: 'hits', relative: 'proportion' },
                y2: { absolute: 'count' },
                formats: {
                    bucket: v => v.toLocaleDateString(),
                    count: v => `${v} event${v !== 1 ? 's' : ''}`,
                    hits: v => `${v} occurence${v !== 1 ? 's' : ''}`,
                    proportion: v => `${v}%`,
                },
                displayAbsoluteRelative: true,
                axisTitleY: 'Action occurrences',
                displayConfigs: ['includeActions', 'excludeActions'],
            },
        },
        conversationsFunnel: {
            chartTypeOptions: ['bar'],
            titleDescription: 'Conversations matching sequence',
            queryParams: {
                envs, queryName: 'conversationsFunnel', langs,
            },
            query: conversationsFunnel,
            graphParams: {
                x: 'name',
                y: { absolute: 'matchCount', relative: 'proportion' },
                axisTitleY: 'Matching',
                axisTitleX: 'Step',
                noXLegend: false,
                axisBottom: {
                    tickRotation: -25,
                    legendOffset: 36,
                    legendPosition: 'middle',
                },
                formats: {
                    name: n => n.replace(/_[0-9]+$/, ''),
                    proportion: v => `${v}%`,
                },
                displayAbsoluteRelative: true,
                displayConfigs: ['selectedSequence'],
                enableArea: true,
                xCanRepeat: true,
                padding: 0,
                enableLabel: true,
                label: d => (`${d.value.toFixed(2)}`),
                colors: (bar) => {
                    if (bar.data && bar.data.name) {
                        if (bar.data.name.includes('utter')) return 'rgb(122, 204, 147)';
                        if (bar.data.name.includes('action')) return 'rgb(239, 171, 208)';
                    }
                    return 'rgb(174, 214, 243)';
                },
                
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
            { temporal, accessor: x, header: axisTitleX },
            { accessor: y.absolute, header: axisTitleY },
            { accessor: y.relative, header: '%' },
        ];
    });
    
    const [, drop] = useDrop({ accept: 'card' });

    const handleChangeCardSettings = index => (updateInput, all = false) => {
        const update = updateInput;
        if (update.name) update.name = findName(update.name, dashboard.cards.map(c => c.name));
        onUpdateDashboard({
            cards: !all // all = true updates all cards
                ? [
                    ...cards.slice(0, index),
                    { ...cards[index], ...update },
                    ...cards.slice(index + 1),
                ]
                : cards.map(card => ({ ...card, ...update })),
        });
    };

    const handleSwapCards = index => (draggedCardName) => {
        const draggedCardIndex = cards.findIndex(c => c.name === draggedCardName);
        const updatedCards = [...cards];
        updatedCards[index] = cards[draggedCardIndex];
        updatedCards[draggedCardIndex] = cards[index];
        onUpdateDashboard({ cards: updatedCards });
    };

    const downloadAll = async () => {
        const dataToExport = [];
        const promises = [];
        const allQueryParams = [];
        const allGraphParams = [];
        const allBuckets = [];
        const allNames = [];
        cards.forEach(({
            startDate, endDate, name, type, ...settings
        }) => {
            const { query, queryParams, graphParams } = cardTypes[type];
            const { nBuckets: nBucketsExport } = calculateTemporalBuckets(moment(startDate), moment(endDate), 'table');
            const { bucketSize } = calculateTemporalBuckets(moment(startDate), moment(endDate), type);

            const variables = {
                projectId,
                envs: [...queryParams.envs, ...(queryParams.envs.includes('development') ? [null] : [])],
                langs: queryParams.langs,
                from: applyTimezoneOffset(startDate, projectTimezoneOffset).valueOf() / 1000,
                to: applyTimezoneOffset(endDate, projectTimezoneOffset).valueOf() / 1000,
                ...clearTypenameField(settings),
                nBuckets: nBucketsExport,
                limit: 100000,
            };
            promises.push(apolloClient.query({ query, variables }).then((response) => {
                const data = response && response.data;
                dataToExport.push(data);
                allQueryParams.push(queryParams);
                allGraphParams.push(graphParams);
                allBuckets.push(bucketSize);
                allNames.push(name);
            }));
        });
        
        await Promise.all(promises);
        const workbook = generateXLSX(dataToExport, allQueryParams, allGraphParams, allBuckets, allNames, projectTimezoneOffset);
        if (window.Cypress) {
            window.getXLSXData = () => workbook;
            return null;
        }
        return downloadXLSX(workbook);
    };

    return (
        <div style={{ overflowY: 'auto', height: 'calc(100% - 49px', marginTop: '0' }}>
            <Container>
                <div className='analytics-dashboard' ref={drop}>
                    {cards.map(({
                        name, type, startDate, endDate, description, ...settings
                    }, index) => (
                        <AnalyticsCard
                            key={name}
                            cardName={name}
                            type={type}
                            {...cardTypes[type]}
                            titleDescription={description || cardTypes[type].titleDescription}
                            settings={{ ...settings, startDate: moment(startDate), endDate: moment(endDate) }}
                            onChangeSettings={handleChangeCardSettings(index)}
                            onReorder={handleSwapCards(index)}
                            downloadAll={() => downloadAll()}
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
