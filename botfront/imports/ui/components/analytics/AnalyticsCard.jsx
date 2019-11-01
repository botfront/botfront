import {
    Button, Popup, Loader, Message, Icon,
} from 'semantic-ui-react';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import { useDrag, useDrop } from 'react-dnd-cjs';
import { calculateTemporalBuckets, getDataToDisplayAndParamsToUse } from '../../../lib/graphs';
import DatePicker from '../common/DatePicker';
import PieChart from '../charts/PieChart';
import BarChart from '../charts/BarChart';
import LineChart from '../charts/LineChart';
import SettingsPortal from './SettingsPortal';

function AnalyticsCard(props) {
    const {
        cardName,
        displayDateRange,
        chartTypeOptions,
        title,
        titleDescription,
        query,
        queryParams,
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
    const { tickValues, nBuckets } = calculateTemporalBuckets(startDate, endDate);

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
        from: startDate.valueOf() / 1000,
        to: endDate.valueOf() / 1000,
        ...(exclude ? { exclude } : {}),
        ...(responses ? { responses } : {}),
        nBuckets,
    };

    const { loading, error, data } = query
        ? useQuery(query, { variables })
        : { loading: true };

    const renderChart = () => {
        const { dataToDisplay, paramsToUse } = getDataToDisplayAndParamsToUse({
            data, queryParams, graphParams, tickValues, valueType,
        });
        if (!dataToDisplay.length) return <Message color='yellow'><Icon name='calendar times' />No data to show for selected period!</Message>;
        if (chartType === 'pie') return <PieChart {...paramsToUse} data={dataToDisplay} />;
        if (chartType === 'bar') return <BarChart {...paramsToUse} data={dataToDisplay} />;
        if (chartType === 'line') return <LineChart {...paramsToUse} data={dataToDisplay} />;
        return null;
    };
    
    const renderExtraOptionsLink = () => {
        if (!exclude) return null;
        return (
            <>
                <SettingsPortal
                    text='Exclude intents'
                    onClose={() => setSettingsOpen(false)}
                    open={settingsOpen}
                    values={exclude}
                    onChange={newVal => onChangeSettings('exclude', newVal)}
                />
                <a className='extra-options-linklike' onClick={() => setSettingsOpen(!settingsOpen)}>
                    {`Excluded intents (${exclude.length})`}
                </a>
            </>
        );
    };

    return (
        <div className='analytics-card' ref={node => drag(drop(node))}>
            {displayDateRange && (
                <div className='date-picker'>
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
                {uniqueChartOptions.length > 1 && (
                    <Button.Group basic size='medium' className='chart-type-selector'>
                        {uniqueChartOptions.map(chartOption => (
                            <Button
                                icon={`chart ${chartOption}`}
                                key={chartOption}
                                className={chartType === chartOption ? 'selected' : ''}
                                onClick={() => onChangeSettings('chartType', chartOption)}
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
    chartTypeOptions: PropTypes.arrayOf(PropTypes.oneOf(['line', 'bar', 'pie'])),
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
