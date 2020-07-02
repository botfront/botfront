import {
    Button, Popup, Loader, Message, Icon, Input, Dropdown,
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
import SettingsPortal from './SettingsPortal';
import Table from '../charts/Table';
import { ProjectContext } from '../../layouts/context';
import { queryifyFilter } from '../../../lib/conversationFilters.utils';
import { clearTypenameField } from '../../../lib/client.safe.utils';

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
            ...settings
        },
        onChangeSettings,
        onReorder,
    } = props;

    const {
        project: {
            _id: projectId, name: projectName = 'Botfront', timezoneOffset: projectTimezoneOffset = 0, nlu_models,
        },
    } = useContext(ProjectContext);
    const [nameEdited, setNameEdited] = useState(null);

    const { displayAbsoluteRelative } = graphParams;
    const uniqueChartOptions = [...new Set(chartTypeOptions)];

    const [settingsOpen, setSettingsOpen] = useState(false);
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


    const linkToConversations = (selectedData, fullDataSet) => {
        const selectedIndex = fullDataSet.findIndex(({ bucket }) => bucket === selectedData.bucket);
        const prevData = fullDataSet[selectedIndex - 1];
        const filters = { startDate, endDate };
        const intentsActionsFilters = [];
        const {
            includeIntents = [],
            excludeIntents = [],
            includeActions = [],
            excludeActions = [],
        } = settings;
        let conversationFunnelIndex;
        switch (type) {
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
            intentsActionsFilters.push(...reshapeIntentOrActionArray(includeIntents, false));
            intentsActionsFilters.push(...reshapeIntentOrActionArray(excludeIntents, true));
        // eslint-disable-next-line no-fallthrough
        case 'actionCounts':
        /* conversation counts support intents other wise it uses the same parameters as action counts
        that's why ere using a adjustDatesAccordingToBucket
        */
            intentsActionsFilters.push(...reshapeIntentOrActionArray(includeActions, false));
            intentsActionsFilters.push(...reshapeIntentOrActionArray(excludeActions, true));
            filters.intentsActionsFilters = clearTypenameField(intentsActionsFilters);
            filters.intentsActionsOperator = 'or';
            if (bucketSize === 'week') {
                const bucketStart = prevData ? prevData.bucket : startDate;
                const bucketEnd = selectedData.bucket;
                filters.startDate = bucketStart;
                filters.endDate = bucketEnd;
            } else {
                filters.startDate = moment(selectedData.bucket).startOf('day');
                filters.endDate = moment(selectedData.bucket).endOf('day');
            }
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

    const renderExtraOptionsLink = (setting) => {
        const values = settings[setting] || [];
        let text = '';
        if (setting === 'includeActions') text = 'Included actions';
        if (setting === 'excludeActions') text = 'Excluded actions';
        if (setting === 'includeIntents') text = 'Included intents';
        if (setting === 'excludeIntents') text = 'Excluded intents';
        if (setting === 'selectedSequence') text = 'Selected Sequence';
        return (
            <React.Fragment key={setting}>
                <SettingsPortal
                    text={text}
                    onClose={() => setSettingsOpen(false)}
                    open={settingsOpen === setting}
                    values={values}
                    onChange={newVal => onChangeSettings({ [setting]: newVal })}
                />
                <Dropdown.Item
                    text={`${text} (${values.length})`}
                    data-cy={`edit-${setting}`}
                    onClick={() => setSettingsOpen(setting)}
                />
            </React.Fragment>
        );
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
                ...variables, limit: 100000, nBuckets: nBucketsForExport,
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
                    <Button
                        className='export-card-button'
                        data-cy='analytics-export-button'
                        basic
                        size='medium'
                        icon='download'
                        onClick={handleExportClick}
                    />
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
                <Dropdown
                    trigger={(
                        <Button
                            className='export-card-button'
                            icon='ellipsis vertical'
                            basic
                            data-cy='card-ellipsis-menu'
                        />
                    )}
                    basic
                >
                    <Dropdown.Menu>
                        <Dropdown.Item
                            text={wide ? 'Shrink to half width' : 'Expand to full width'}
                            data-cy='toggle-wide'
                            onClick={() => onChangeSettings({ wide: !wide })}
                        />
                        {graphParams.y2 && (
                            <Dropdown.Item
                                text={showDenominator ? 'Hide denominator' : 'Show denominator'}
                                data-cy='toggle-denominator'
                                onClick={() => onChangeSettings({ showDenominator: !showDenominator })}
                            />
                        )}
                        <React.Fragment>
                            <SettingsPortal
                                text='Edit description'
                                onClose={() => setSettingsOpen(false)}
                                open={settingsOpen === 'description'}
                                values={titleDescription}
                                onChange={newVal => onChangeSettings({ description: newVal })}
                            />
                            <Dropdown.Item
                                text='Edit description'
                                data-cy='edit-description'
                                onClick={() => setSettingsOpen('description')}
                            />
                        </React.Fragment>
                        {(graphParams.displayConfigs || []).map(renderExtraOptionsLink)}
                    </Dropdown.Menu>
                </Dropdown>
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
