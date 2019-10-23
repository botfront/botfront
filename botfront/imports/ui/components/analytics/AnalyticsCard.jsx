import { Button, Popup, Loader } from 'semantic-ui-react';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useQuery } from '@apollo/react-hooks';
import DatePicker from '../common/DatePicker';
import PieChart from '../charts/PieChart';
import BarChart from '../charts/BarChart';
import LineChart from '../charts/LineChart';

function AnalyticsCard(props) {
    const [startDate, setStartDate] = useState(moment().subtract(7, 'days'));
    const [endDate, setEndDate] = useState(moment());

    const {
        displayDateRange,
        chartTypeOptions,
        title,
        titleDescription,
        displayAbsoluteRelative,
        query,
        queryName,
        variables: propVars,
        graphParams,
    } = props;

    const variables = { ...propVars, from: startDate.valueOf() / 1000, to: endDate.valueOf() / 1000 };

    const { loading, error, data } = query
        ? useQuery(query, { variables })
        : { loading: true };

    const uniqueChartOptions = [...new Set(chartTypeOptions)];

    const [chartType, setChartType] = useState(uniqueChartOptions[0] || 'line');
    const [valueType, setValueType] = useState(
        displayAbsoluteRelative ? 'absolute' : null,
    );

    const renderChart = () => {
        if (chartType === 'pie') return <PieChart {...graphParams} data={data[queryName]} />;
        if (chartType === 'bar') return <BarChart {...graphParams} data={data[queryName]} />;
        if (chartType === 'line') return <LineChart {...graphParams} data={data[queryName]} />;
        return null;
    };

    return (
        <div className='analytics-card'>
            {displayDateRange && (
                <div className='date-picker'>
                    <DatePicker
                        startDate={startDate}
                        endDate={endDate}
                        onConfirm={(newStart, newEnd) => {
                            setStartDate(newStart);
                            setEndDate(newEnd);
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
                                onClick={() => setChartType(chartOption)}
                            />
                        ))}
                    </Button.Group>
                )}
                {displayAbsoluteRelative && (
                    <Button.Group basic size='small' className='unit-selector'>
                        <Button
                            icon='hashtag'
                            onClick={() => setValueType('absolute')}
                            className={valueType === 'absolute' ? 'selected' : ''}
                        />
                        <Button
                            icon='percent'
                            onClick={() => setValueType('relative')}
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
    title: PropTypes.string.isRequired,
    titleDescription: PropTypes.string,
    displayDateRange: PropTypes.bool,
    chartTypeOptions: PropTypes.arrayOf(PropTypes.oneOf(['line', 'bar', 'pie'])),
    displayAbsoluteRelative: PropTypes.bool,
    query: PropTypes.any.isRequired,
    queryName: PropTypes.string.isRequired,
    variables: PropTypes.object.isRequired,
    graphParams: PropTypes.object,
};

AnalyticsCard.defaultProps = {
    displayDateRange: true,
    chartTypeOptions: ['line', 'bar'],
    displayAbsoluteRelative: false,
    titleDescription: null,
    graphParams: {},
};

export default AnalyticsCard;
