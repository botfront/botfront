import {
    Button, Popup, Loader, Message, Icon, Input, Dropdown,
} from 'semantic-ui-react';
import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import { useDrag, useDrop } from 'react-dnd-cjs';
import { saveAs } from 'file-saver';
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

function AnalyticsCard(props) {
    const {
        cardName,
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

    const { project: { _id: projectId, name: projectName = 'Botfront', timezoneOffset: projectTimezoneOffset = 0 } } = useContext(ProjectContext);

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
        ...settings,
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

    const renderChart = () => {
        const { dataToDisplay, paramsToUse } = getDataToDisplayAndParamsToUse({
            data, queryParams, graphParams, nTicks, valueType, bucketSize, projectTimezoneOffset, wide, showDenominator,
        });
        if (!dataToDisplay.length) return <Message color='yellow'><Icon name='calendar times' data-cy='no-data-message' />No data to show for selected period!</Message>;
        if (chartType === 'pie') return <PieChart {...paramsToUse} data={dataToDisplay} />;
        if (chartType === 'bar') return <BarChart {...paramsToUse} data={dataToDisplay} />;
        if (chartType === 'line') return <LineChart {...paramsToUse} data={dataToDisplay} />;
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
                {!error && !loading && data[queryParams.queryName].length > 0 && (
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
                        <React.Fragment key='description'>
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
            <div className='graph-render-zone' data-cy='analytics-chart'>
                {(!error && !loading && data) ? (
                    renderChart()
                ) : (
                    <Loader active size='large'>Loading</Loader>
                )}
            </div>
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
};

AnalyticsCard.defaultProps = {
    displayDateRange: true,
    chartTypeOptions: ['line', 'bar'],
    titleDescription: null,
    graphParams: {},
    onReorder: null,
};

export default AnalyticsCard;
