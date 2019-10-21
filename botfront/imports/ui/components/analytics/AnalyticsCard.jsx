import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import DatePicker from '../common/DatePicker';

function AnalyticsCards() {
    const [dataLoaded, setDataLoaded] = useState(false);
    return (
        <div className='analytics-card'>
            <div className='date-picker'>
                <DatePicker startDate={moment()} endDate={moment().subtract(7, 'days')} />
            </div>
        </div>
    );
}

AnalyticsCards.propTypes = {
    render: PropTypes.func,
};

AnalyticsCards.defaultProps = {
    render: () => {},
}

export default AnalyticsCards;
