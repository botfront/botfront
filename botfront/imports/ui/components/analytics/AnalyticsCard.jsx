import { Button, Popup, Loader } from 'semantic-ui-react';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import DatePicker from '../common/DatePicker';

function AnalyticsCards(props) {
    const [dataLoaded, setDataLoaded] = useState(null);
    const [startDate, setStartDate] = useState(moment().subtract(7, 'days'));
    const [endDate, setEndDate] = useState(moment());

    const {
        render,
        displayDateRange,
        chartTypeOptions,
        title,
        titleDescription,
        displayAbsoluteRelative,
        dataFetchPromise,
    } = props;

    // This fetches the data
    useEffect(() => {
        if (dataFetchPromise) {
            const promise = dataFetchPromise(startDate, endDate);
            promise
                .then((data) => {
                    setDataLoaded(data);
                })
                .catch((error) => {
                    // eslint-disable-next-line no-console
                    console.log(
                        `an error occured while fetching analytics data : ${error}`,
                    );
                });
        }
    }, []);

    const uniqueChartOptions = [...new Set(chartTypeOptions)];

    const [chartType, setChartType] = useState(uniqueChartOptions[0] || 'line');
    const [valueType, setValueType] = useState(
        displayAbsoluteRelative ? 'absolute' : null,
    );

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
                {dataLoaded ? (
                    render({
                        startDate,
                        endDate,
                        chartType,
                        valueType,
                        dataLoaded,
                    })
                ) : (
                    <Loader active size='large'>Loading</Loader>
                )}
            </div>
        </div>
    );
}

AnalyticsCards.propTypes = {
    render: PropTypes.func,
    title: PropTypes.string.isRequired,
    titleDescription: PropTypes.string,
    displayDateRange: PropTypes.bool,
    chartTypeOptions: PropTypes.arrayOf(PropTypes.oneOf(['line', 'bar', 'pie'])),
    displayAbsoluteRelative: PropTypes.bool,
    dataFetchPromise: PropTypes.func.isRequired,
};

AnalyticsCards.defaultProps = {
    render: () => {},
    displayDateRange: true,
    chartTypeOptions: ['line', 'bar'],
    displayAbsoluteRelative: false,
    titleDescription: null,
};

export default AnalyticsCards;
