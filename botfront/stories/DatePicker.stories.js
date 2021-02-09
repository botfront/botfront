import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import DatePicker from '../imports/ui/components/common/DatePicker';

const DatePickerWrapped = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    function onConfirm(newStartDate, newEndDate) {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    }

    return <DatePicker startDate={startDate} endDate={endDate} onConfirm={onConfirm} />;
};

storiesOf('DatePicker', module).add('default', () => <DatePickerWrapped />);
