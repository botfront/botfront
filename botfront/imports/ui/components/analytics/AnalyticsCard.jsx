import {
    Button, Popup, Loader, Message, Icon,
} from 'semantic-ui-react';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import { useDrag, useDrop } from 'react-dnd-cjs';
import moment from 'moment';
import { saveAs } from 'file-saver';
import {
    calculateTemporalBuckets, getDataToDisplayAndParamsToUse, generateCSV,
} from '../../../lib/graphs';
import DatePicker from '../common/DatePicker';
import PieChart from '../charts/PieChart';
import BarChart from '../charts/BarChart';
import LineChart from '../charts/LineChart';
import SettingsPortal from './SettingsPortal';
import { Projects } from '../../../api/project/project.collection';
import Table from '../charts/Table';
import { client } from '../../../startup/client/routes';

export const applyTimezoneOffset = (date, offset) => moment(date).utcOffset(offset, true);

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
            responses,
        },
        onChangeSettings,
        onReorder,
    } = props;
    
    const displayAbsoluteRelative = 'rel' in graphParams;
    const uniqueChartOptions = [...new Set(chartTypeOptions)];

    const [settingsOpen, setSettingsOpen] = useState(false);
    const { nTicks, nBuckets, bucketSize } = calculateTemporalBuckets(startDate, endDate, chartType);
    const [projectTimezoneOffset, setProjectTimezoneOffset] = useState(0);

    useEffect(() => {
        const {
            timezoneOffset,
        } = Projects.findOne({ _id: queryParams.projectId }, { fields: { timezoneOffset: 1 } });
        setProjectTimezoneOffset(timezoneOffset);
    }, []);

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
            if (draggedCard !== cardName) {
                onReorder(draggedCard, cardName);
            }
        },
    });
    

    const variables = {
        projectId: queryParams.projectId,
        envs: queryParams.envs,
        from: applyTimezoneOffset(startDate, projectTimezoneOffset).valueOf() / 1000,
        to: applyTimezoneOffset(endDate, projectTimezoneOffset).valueOf() / 1000,
        ...(exclude ? { exclude } : {}),
        fallbacks: responses || [],
        nBuckets,
    };

    const { loading, error, data } = query
        ? useQuery(query, { variables })
        : { loading: true };

    const renderChart = () => {
        const { dataToDisplay, paramsToUse } = getDataToDisplayAndParamsToUse({
            data, queryParams, graphParams, nTicks, valueType, bucketSize,
        });
        if (!dataToDisplay.length) return <Message color='yellow'><Icon name='calendar times' />No data to show for selected period!</Message>;
        if (chartType === 'pie') return <PieChart {...paramsToUse} data={dataToDisplay} />;
        if (chartType === 'bar') return <BarChart {...paramsToUse} data={dataToDisplay} />;
        if (chartType === 'line') return <LineChart {...paramsToUse} data={dataToDisplay} />;
        if (chartType === 'table') return <Table {...paramsToUse} data={dataToDisplay} bucketSize={bucketSize} />;
        return null;
    };
    
    const renderExtraOptionsLink = () => {
        if (!exclude && !responses) return null;
        let text; let values; let setting;
        if (exclude) {
            text = 'Excluded intents';
            values = exclude;
            setting = 'exclude';
        } else if (responses) {
            text = 'Fallback templates';
            values = responses;
            setting = 'responses';
        }
        return (
            <>
                <SettingsPortal
                    text={text}
                    onClose={() => setSettingsOpen(false)}
                    open={settingsOpen}
                    values={values}
                    onChange={newVal => onChangeSettings(setting, newVal)}
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
        const { data: completeDataset } = await client.query({
            query,
            variables: {
                ...variables, ...exportQueryParams, nBuckets: nBucketsForExport,
            },
        });
        const csvData = generateCSV(completeDataset, { ...queryParams, ...exportQueryParams }, bucketSize);
        const csvBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
        saveAs(csvBlob, `${cardName}.csv`);
    };

    return (
        <div className='analytics-card' ref={node => drag(drop(node))} data-cy='analytics-card'>
            {displayDateRange && (
                <div className='date-picker' data-cy='date-picker-container'>
                    <DatePicker
                        startDate={startDate}
                        endDate={endDate}
                        onConfirm={(newStart, newEnd) => {
                            onChangeSettings('startDate', newStart);
                            onChangeSettings('endDate', newEnd);
                        }}
                    />
                </div>
            )}
            <span className='top-right-buttons'>
                {
                    <Button
                        className='export-card-button'
                        basic
                        size='medium'
                        icon='download'
                        onClick={handleExportClick}
                    />
                }
                {uniqueChartOptions.length > 1 && (
                    <Button.Group basic size='medium' className='chart-type-selector'>
                        {uniqueChartOptions.map(chartOption => (
                            <Button
                                icon={getIconName(chartOption)}
                                key={chartOption}
                                className={chartType === chartOption ? 'selected' : ''}
                                onClick={() => onChangeSettings('chartType', chartOption)}
                                data-cy='chart-type-button'
                            />
                        ))}
                    </Button.Group>
                )}
                {displayAbsoluteRelative && (
                    <Button.Group basic size='small' className='unit-selector'>
                        <Button
                            icon='hashtag'
                            onClick={() => onChangeSettings('valueType', 'absolute')}
                            className={valueType === 'absolute' ? 'selected' : ''}
                        />
                        <Button
                            icon='percent'
                            onClick={() => onChangeSettings('valueType', 'relative')}
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
            <div className='graph-render-zone'>
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
};

AnalyticsCard.defaultProps = {
    displayDateRange: true,
    chartTypeOptions: ['line', 'bar'],
    titleDescription: null,
    graphParams: {},
    exportQueryParams: {},
    onReorder: null,
};

export default AnalyticsCard;
