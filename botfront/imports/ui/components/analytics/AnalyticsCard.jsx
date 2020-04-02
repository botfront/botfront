import {
    Button, Popup, Loader, Message, Icon,
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
        title,
        titleDescription,
        query,
        queryParams,
        exportQueryParams,
        graphParams,
        settings: {
            endDate,
            startDate,
            chartType,
            valueType,
            exclude,
            include,
        },
        size,
        onChangeSettings,
        onReorder,
    } = props;

    const { project: { _id: projectId, name: projectName = 'Botfront', timezoneOffset: projectTimezoneOffset = 0 } } = useContext(ProjectContext);
    
    const displayAbsoluteRelative = 'rel' in graphParams;
    const uniqueChartOptions = [...new Set(chartTypeOptions)];

    const [settingsOpen, setSettingsOpen] = useState(false);
    const { nTicks, nBuckets, bucketSize } = calculateTemporalBuckets(startDate, endDate, chartType, size);
    const [activateDownload, setActivateDownload] = useState(false);

    const [, drag] = useDrag({
        item: { type: 'card', cardName },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const [, drop] = useDrop({
        accept: 'card',
        canDrop: () => false,
        hover({ cardName: draggedCard }) {
            if (draggedCard !== cardName) onReorder(draggedCard);
        },
    });
    const variables = {
        projectId,
        envs: [...queryParams.envs, ...(queryParams.envs.includes('development') ? [null] : [])],
        langs: queryParams.langs,
        from: applyTimezoneOffset(startDate, projectTimezoneOffset).valueOf() / 1000,
        to: applyTimezoneOffset(endDate, projectTimezoneOffset).valueOf() / 1000,
        ...(exclude ? { exclude } : {}),
        ...(include ? { include } : {}),
        nBuckets,
        limit: chartType === 'table' ? 100000 : undefined,
    };
    const { loading, error, data } = query
        ? useQuery(query, { variables })
        : { loading: true };
    
    const [getExportData, { error: exportError, data: exportData }] = useLazyQuery(query);
    const downloadCSV = () => {
        const csvData = generateCSV(exportData, { ...queryParams, ...exportQueryParams }, bucketSize, projectTimezoneOffset, graphParams.columns);
        const csvBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
        const start = applyTimezoneOffset(startDate, projectTimezoneOffset);
        const end = applyTimezoneOffset(endDate, projectTimezoneOffset);
        const fileName = `${projectName}-${title.replace(/ /g, '')}-(${start.toISOString()})-(${end.toISOString()})`;
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
            data, queryParams, graphParams, nTicks, valueType, bucketSize, projectTimezoneOffset, size,
        });
        if (!dataToDisplay.length) return <Message color='yellow'><Icon name='calendar times' data-cy='no-data-message' />No data to show for selected period!</Message>;
        if (chartType === 'pie') return <PieChart {...paramsToUse} data={dataToDisplay} />;
        if (chartType === 'bar') return <BarChart {...paramsToUse} data={dataToDisplay} />;
        if (chartType === 'line') return <LineChart {...paramsToUse} data={dataToDisplay} />;
        if (chartType === 'table') return <Table {...paramsToUse} data={dataToDisplay} bucketSize={bucketSize} />;
        return null;
    };
    
    const renderExtraOptionsLink = () => {
        if (!exclude && !include) return null;
        let text; let values; let setting;
        if (exclude) {
            text = 'Excluded intents';
            values = exclude;
            setting = 'exclude';
        } else if (include) {
            text = 'Fallback actions';
            values = include;
            setting = 'include';
        }
        return (
            <>
                <SettingsPortal
                    text={text}
                    onClose={() => setSettingsOpen(false)}
                    open={settingsOpen}
                    values={values}
                    onChange={newVal => onChangeSettings({ [setting]: newVal })}
                />
                <button type='button' className='extra-options-linklike' onClick={() => setSettingsOpen(!settingsOpen)}>
                    {`${text} (${values.length})`}
                </button>
            </>
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
                ...variables, ...exportQueryParams, nBuckets: nBucketsForExport,
            },
        });
        setActivateDownload(true);
    };

    return (
        <div
            className={`analytics-card ${size === 'wide' ? 'wide' : ''}`}
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
            </span>
            {titleDescription ? (
                <Popup
                    trigger={<span className='title'>{title}</span>}
                    content={titleDescription}
                />
            ) : (
                <span className='title'>{title}</span>
            )}
            {renderExtraOptionsLink()}
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
    title: PropTypes.string.isRequired,
    titleDescription: PropTypes.string,
    displayDateRange: PropTypes.bool,
    chartTypeOptions: PropTypes.arrayOf(PropTypes.oneOf(['line', 'bar', 'pie', 'table'])),
    query: PropTypes.any.isRequired,
    queryParams: PropTypes.object.isRequired,
    exportQueryParams: PropTypes.object,
    graphParams: PropTypes.object,
    settings: PropTypes.object.isRequired,
    onChangeSettings: PropTypes.func.isRequired,
    onReorder: PropTypes.func,
    size: PropTypes.string,
};

AnalyticsCard.defaultProps = {
    displayDateRange: true,
    chartTypeOptions: ['line', 'bar'],
    titleDescription: null,
    graphParams: {},
    exportQueryParams: {},
    onReorder: null,
    size: 'standard',
};

export default AnalyticsCard;
