import {
    Button, Popup, Loader, Message, Icon, Input,
} from 'semantic-ui-react';
import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import { useDrag, useDrop } from 'react-dnd-cjs';
import { saveAs } from 'file-saver';
import { browserHistory } from 'react-router';
import moment from 'moment';
import {
    calculateTemporalBuckets, getDataToDisplayAndParamsToUse, generateCSV, applyTimezoneOffset,
} from '../../../lib/graphs';
import DatePicker from '../common/DatePicker';
import PieChart from '../charts/PieChart';
import BarChart from '../charts/BarChart';
import LineChart from '../charts/LineChart';
import Table from '../charts/Table';
import { ProjectContext } from '../../layouts/context';
import { queryifyFilter } from '../../../lib/conversationFilters.utils';
import { clearTypenameField } from '../../../lib/client.safe.utils';
import SettingsMenu from './SettingsMenu';

function AnalyticsCard(props) {
    const {
        cardName,
        type,
        displayDateRange,
        chartTypeOptions,
        titleDescription,
        query,
        queryParams,
        graphParams,
        settings: {
            endDate,
            startDate,
            chartType,
            valueType,
            wide,
            showDenominator,
        },
        settings,
        onChangeSettings,
        onReorder,
        downloadAll,
    } = props;

    const {
        project: {
            _id: projectId, name: projectName = 'Botfront', timezoneOffset: projectTimezoneOffset = 0, nlu_models,
        },
    } = useContext(ProjectContext);

    const [nameEdited, setNameEdited] = useState(null);

    const { displayAbsoluteRelative } = graphParams;
    const uniqueChartOptions = [...new Set(chartTypeOptions)];

    const { nTicks, nBuckets, bucketSize } = calculateTemporalBuckets(startDate, endDate, chartType, wide);
    const [activateDownload, setActivateDownload] = useState(false);

    const [, drag] = useDrag({
        item: { type: 'card', cardName },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: () => nameEdited === null,
    });
    const [{ canDrop, isOver }, drop] = useDrop({
        accept: 'card',
        drop: ({ cardName: draggedCard }) => {
            if (draggedCard !== cardName) onReorder(draggedCard);
        },
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const variables = {
        projectId,
        envs: [...queryParams.envs, ...(queryParams.envs.includes('development') ? [null] : [])],
        langs: queryParams.langs,
        from: applyTimezoneOffset(startDate, projectTimezoneOffset).valueOf() / 1000,
        to: applyTimezoneOffset(endDate, projectTimezoneOffset).valueOf() / 1000,
        ...clearTypenameField(settings),
        nBuckets,
        ...(settings.limit ? { limit: chartType !== 'table' ? Number(settings.limit) : -1 } : { limit: -1 }),
        ...(settings.conversationLength ? { conversationLength: Number(settings.conversationLength) } : { conversationLength: -1 }),
        ...(queryParams.intentTypeFilter ? { intentTypeFilter: queryParams.intentTypeFilter } : {}),
    };
    const { loading, error, data } = query
        ? useQuery(query, { variables })
        : { loading: true };

    const [getExportData, { error: exportError, data: exportData }] = useLazyQuery(query);
    const downloadCSV = () => {
        const csvData = generateCSV(exportData, queryParams, graphParams, bucketSize, projectTimezoneOffset);
        const csvBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
        const fileName = `${projectName}-${cardName.replace(/ /g, '')}-(${startDate.toISOString()})-(${endDate.toISOString()})`;
        if (!window.Cypress) { // prevent file from downloading during tests
            saveAs(csvBlob, `${fileName}.csv`);
        }
    };
    if (exportData !== undefined && activateDownload === true) {
        setActivateDownload(false);
        downloadCSV();
    }
    if (exportError && activateDownload === true) {
        setActivateDownload(false);
        // eslint-disable-next-line no-console
        if (process.env.MODE === 'development') console.log(exportError);
    }

    const getCompareObject = (compare) => {
        if (compare === '< 30') return ({ compareLowerBound: 0, compareUpperBound: 30 });
        if (compare === '30 < 60') return ({ compareLowerBound: 30, compareUpperBound: 60 });
        if (compare === '60 < 90') return ({ compareLowerBound: 60, compareUpperBound: 90 });
        if (compare === '90 < 120') return ({ compareLowerBound: 90, compareUpperBound: 120 });
        if (compare === '120 < 180') return ({ compareLowerBound: 120, compareUpperBound: 180 });
        if (compare === '> 180') return ({ compareLowerBound: 180, compareUpperBound: -1 });
        return undefined;
    };

    const reshapeIntentOrActionArray = (array, exclude) => {
        if (array) {
            return array.map(elm => ({ name: elm, excluded: exclude }));
        }
        return [];
    };

    const getTriggerIntentFromStory = async (storyName) => {
        const intentMapping = await Meteor.callWithPromise(
            'stories.getTriggerIntents',
            projectId, { includeFields: { title: 1, triggerIntent: 1 }, key: 'title' },
        );
        return intentMapping[storyName].triggerIntent;
    };

    const getDateRangeForLinking = (selectedData, prevData) => {
        if (bucketSize === 'week') {
            const bucketStart = prevData ? prevData.bucket : startDate;
            const bucketEnd = selectedData.bucket;
            return ({
                startDate: bucketStart,
                endDate: bucketEnd,
            });
        }
        return ({
            startDate: moment(selectedData.bucket).startOf('day'),
            endDate: moment(selectedData.bucket).endOf('day'),
        });
    };

    const linkToConversations = async (selectedData, fullDataSet) => {
        const selectedIndex = fullDataSet.findIndex(({ bucket }) => bucket === selectedData.bucket);
        const prevData = fullDataSet[selectedIndex - 1];
        const filters = {
            startDate,
            endDate,
            // for the "conversationCounts" and "actionCounts" card overwrite the start date and end date
            ...(['conversationCounts', 'actionCounts'].includes(type)
                ? getDateRangeForLinking(selectedData, prevData)
                : {}
            ),
            env: queryParams.envs[0],
            unerInitiatedConversations: true,
            triggeredConversations: true,
        };
        const intentsActionsFilters = [];
        const {
            includeActions = [],
            excludeActions = [],
            conversationLength,
            userInitiatedConversations,
            triggerConversations,
            intentsAndActionsFilters,
            intentsAndActionsOperator,
        } = settings;
        let conversationFunnelIndex;
        switch (type) {
        case 'triggerFrequencies':
            intentsActionsFilters.push(...reshapeIntentOrActionArray([await getTriggerIntentFromStory(selectedData.name)], false));
            filters.intentsActionsFilters = intentsActionsFilters;
            break;
        case 'intentFrequencies':
            intentsActionsFilters.push(...reshapeIntentOrActionArray([selectedData.name], false));
            filters.intentsActionsFilters = clearTypenameField(intentsActionsFilters);
            break;
        case 'conversationLengths':
            filters.lengthFilter = { compare: selectedData.length, xThan: 'equals' };
            break;
        case 'conversationDurations':
            filters.durationFilter = getCompareObject(selectedData.duration);
            break;
        case 'conversationsFunnel':
            conversationFunnelIndex = parseInt(selectedData.name.match(/[0-9]+$/)[0], 10);
            filters.intentsActionsFilters = clearTypenameField(settings.selectedSequence.slice(0, conversationFunnelIndex + 1));
            filters.intentsActionsOperator = 'inOrder';
            break;
        case 'conversationCounts':
            if (!triggerConversations) {
                filters.triggeredConversations = false;
            }
            if (!userInitiatedConversations) {
                filters.userInitiatedConversations = false;
            }
            filters.lengthFilter = { compare: conversationLength, xThan: 'greaterThan' };
            filters.intentsActionsFilters = clearTypenameField(intentsAndActionsFilters || []);
            filters.intentsActionsOperator = intentsAndActionsOperator;
            break;
        case 'actionCounts':
            intentsActionsFilters.push(...reshapeIntentOrActionArray(includeActions, false));
            intentsActionsFilters.push(...reshapeIntentOrActionArray(excludeActions, true));
            filters.intentsActionsFilters = clearTypenameField(intentsActionsFilters);
            filters.intentsActionsOperator = 'or';
            break;
        default:
            break;
        }
        const queryObject = {};
        Object.keys(filters).forEach((key) => {
            queryObject[key] = queryifyFilter(key, filters[key]);
        });
        browserHistory.push({ pathname: `/project/${projectId}/incoming/${nlu_models[0]}/conversations/`, query: queryObject });
    };

    const renderChart = () => {
        const { dataToDisplay, paramsToUse } = getDataToDisplayAndParamsToUse({
            data, queryParams, graphParams, nTicks, valueType, bucketSize, projectTimezoneOffset, wide, showDenominator,
        });
        
        if (!dataToDisplay.length) return <Message color='yellow'><Icon name='calendar times' data-cy='no-data-message' />No data to show for selected period!</Message>;
        if (chartType === 'pie') return <PieChart {...paramsToUse} data={dataToDisplay} linkToConversations={linkToConversations} />;
        if (chartType === 'bar') return <BarChart {...paramsToUse} data={dataToDisplay} linkToConversations={linkToConversations} />;
        if (chartType === 'line') return <LineChart {...paramsToUse} data={dataToDisplay} linkToConversations={linkToConversations} />;
        if (chartType === 'table') return <Table {...paramsToUse} data={dataToDisplay} bucketSize={bucketSize} />;
        return null;
    };

    const getIconName = (chartOption) => {
        if (chartOption === 'table') {
            return chartOption;
        }
        return `chart ${chartOption}`;
    };

    const handleExportClick = async () => {
        const { nBuckets: nBucketsForExport } = calculateTemporalBuckets(startDate, endDate, 'table');
        getExportData({
            variables: {
                ...variables, nBuckets: nBucketsForExport, limit: -1,
            },
        });
        setActivateDownload(true);
    };

    const submitNameChange = () => {
        if (nameEdited.trim()) onChangeSettings({ name: nameEdited.trim() });
        setNameEdited(null);
    };

    const handleKeyDownInput = (e) => {
        if (e.key === 'Enter') submitNameChange();
        if (e.key === 'Escape') setNameEdited(null);
    };

    return (
        <div
            className={`analytics-card ${wide ? 'wide' : ''} ${canDrop ? (isOver ? 'upload-target' : 'faded-upload-target') : ''}`}
            ref={node => drag(drop(node))}
            data-cy='analytics-card'
        >
            {displayDateRange && (
                <div className='date-picker' data-cy='date-picker-container'>
                    <DatePicker
                        startDate={startDate}
                        endDate={endDate}
                        onConfirm={(newStart, newEnd) => {
                            onChangeSettings({ startDate: newStart, endDate: newEnd });
                        }}
                        onConfirmForAll={(newStart, newEnd) => {
                            onChangeSettings({ startDate: newStart, endDate: newEnd }, true);
                        }}
                    />
                </div>
            )}
            <span className='top-right-buttons'>
                {!error && !loading && data && data[queryParams.queryName].length > 0 && (
                   

                    <Popup
                        trigger={(
                            <Button
                                className='export-card-button'
                                data-cy='analytics-export-button'
                                basic
                                size='medium'
                                icon='download'
                                onClick={handleExportClick}
                            />
                        )}
                        hoverable
                        on='hover'
                        className='export-all-popup'
                        disabled={!downloadAll}
                    >
                        <Button
                            data-cy='analytics-export-all-button'
                            className='export-all-button'
                            basic
                            content='Export all widgets (.xslx)'
                            onClick={() => downloadAll()}
                        />
                    </Popup>
                      
                )}
                {uniqueChartOptions.length > 1 && (
                    <Button.Group basic size='medium' className='chart-type-selector'>
                        {uniqueChartOptions.map(chartOption => (
                            <Button
                                icon={getIconName(chartOption)}
                                key={chartOption}
                                className={chartType === chartOption ? 'selected' : ''}
                                onClick={() => onChangeSettings({ chartType: chartOption })}
                                data-cy={`${chartOption}-chart-button`}
                            />
                        ))}
                    </Button.Group>
                )}
                {displayAbsoluteRelative && (
                    <Button.Group basic size='small' className='unit-selector'>
                        <Button
                            icon='hashtag'
                            onClick={() => onChangeSettings({ valueType: 'absolute' })}
                            className={valueType === 'absolute' ? 'selected' : ''}
                        />
                        <Button
                            icon='percent'
                            onClick={() => onChangeSettings({ valueType: 'relative' })}
                            className={valueType === 'relative' ? 'selected' : ''}
                        />
                    </Button.Group>
                )}
                <SettingsMenu
                    settings={settings}
                    onChangeSettings={onChangeSettings}
                    titleDescription={titleDescription}
                    displayConfigs={graphParams.displayConfigs}
                    denominatorLine={!!graphParams.y2}
                />
            </span>
            {nameEdited === null
                ? (
                    <Popup
                        trigger={<span className='title' onDoubleClick={() => setNameEdited(cardName)}>{cardName}</span>}
                        content={titleDescription}
                    />
                )
                : (
                    <Input
                        onChange={(_, { value }) => setNameEdited(value)}
                        value={nameEdited}
                        autoFocus
                        fluid
                        className='title'
                        onKeyDown={handleKeyDownInput}
                        onBlur={submitNameChange}
                    />
                )
            }
            <div className={`graph-render-zone ${chartType}`} data-cy='analytics-chart'>
                {(!error && !loading && data) ? (
                    renderChart()
                ) : (
                    <Loader active size='large'>Loading</Loader>
                )}
            </div>
            {/* <Button onClick={() => linkToConversations()}>Conversations</Button> */}
        </div>
    );
}

AnalyticsCard.propTypes = {
    cardName: PropTypes.string.isRequired,
    titleDescription: PropTypes.string,
    displayDateRange: PropTypes.bool,
    chartTypeOptions: PropTypes.arrayOf(PropTypes.oneOf(['line', 'bar', 'pie', 'table'])),
    query: PropTypes.any.isRequired,
    queryParams: PropTypes.object.isRequired,
    graphParams: PropTypes.object,
    settings: PropTypes.object.isRequired,
    onChangeSettings: PropTypes.func.isRequired,
    onReorder: PropTypes.func,
    type: PropTypes.string,
    downloadAll: PropTypes.func.isRequired,
};

AnalyticsCard.defaultProps = {
    displayDateRange: true,
    chartTypeOptions: ['line', 'bar'],
    titleDescription: null,
    graphParams: {},
    onReorder: null,
    type: null,
};

export default AnalyticsCard;
