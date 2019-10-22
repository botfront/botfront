import { Button } from 'semantic-ui-react';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import DatePicker from '../common/DatePicker';

function AnalyticsCards(props) {
    const [dataLoaded, setDataLoaded] = useState(false);
    const [startDate, setStartDate] = useState(moment().subtract(7, 'days'));
    const [endDate, setEndDate] = useState(moment());

    const {
        render, displayDateRange, chartTypeOptions, title,
    } = props;
    const uniqueChartOptions = [...new Set(chartTypeOptions)];

    const [chartType, setChartType] = useState(uniqueChartOptions[0] || 'line');

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
                <Button.Group basic size='small' className='unit-selector'>
                    <Button icon='hashtag' />
                    <Button icon='percent' />
                </Button.Group>
                {render()}
            </span>
            <span className='title'>{title}</span>
        </div>
    );
}

AnalyticsCards.propTypes = {
    render: PropTypes.func,
    title: PropTypes.string.isRequired,
    displayDateRange: PropTypes.bool,
    chartTypeOptions: PropTypes.arrayOf(PropTypes.oneOf(['line', 'bar', 'pie'])),
};

AnalyticsCards.defaultProps = {
    render: () => {},
    displayDateRange: true,
    chartTypeOptions: ['line', 'bar'],
};

export default AnalyticsCards;
