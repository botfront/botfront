/* eslint-disable no-underscore-dangle */

import 'react-dates/initialize';
import moment from 'moment';
import { DayPickerRangeController } from 'react-dates';
import React, { useState } from 'react';
import {
    Popup, Button, Icon, Form, Menu,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';

if (!Meteor.isTest) {
    import 'react-dates/lib/css/_datepicker.css';
}

function DatePicker({ startDate, endDate, onConfirm }) {
    const [focusedInput, setFocusedInput] = useState('startDate');
    const [newStartDate, setNewStartDate] = useState(startDate);
    const [newEndDate, setNewEndDate] = useState(endDate);
    const [popupOpen, setPopupOpen] = useState(false);
    const [selectedRangeType, setSelectedRangeType] = useState(0);
    const [customRange, setCustomRange] = useState({ startDate: null, endDate: null });

    function setNewDates(start, end) {
        setNewStartDate(start);
        setNewEndDate(end);
    }

    function getDateString(start, end) {
        return `${start ? `${start.format('DD MMM YYYY')} - ` : ''}${end ? end.format('DD MMM YYYY') : ''}`;
    }

    function sendNewDates() {
        onConfirm(newStartDate, newEndDate);
        setPopupOpen(!popupOpen);
    }
    /* the value field should is the array index of the object
     it is used to get the data field after a selection in the dropdown
     the dropdown does not support objects in its value so this a workaround */
    const DateOptions = [
        {
            key: 'custom',
            text: `Custom: ${getDateString(customRange.startDate || startDate, customRange.endDate || endDate)}`,
            value: 0,
            data: { startDate: customRange.startDate || startDate, endDate: customRange.endDate || endDate },
        },
        {
            key: 'seven',
            text: 'Last 7 days',
            value: 1,
            data: { startDate: moment().subtract(7, 'days'), endDate: moment() },
        },
        {
            key: 'thirty',
            text: 'Last 30 days',
            value: 2,
            data: { startDate: moment().subtract(30, 'days'), endDate: moment() },
        },
        {
            key: 'ninety',
            text: 'Last 90 days',
            value: 3,
            data: { startDate: moment().subtract(90, 'days'), endDate: moment() },
        },
    ];

    function datesChange(incomingRange) {
        const newRange = incomingRange;
        if (!newRange.endDate) { // selection has a range of one day
            newRange.endDate = moment(newRange.startDate.endOf('day')._d);
            newRange.startDate = moment(newRange.startDate.startOf('day')._d);
        }
        setSelectedRangeType(0); // if there is date change, the range type is always custom (index 0)
        setCustomRange({ startDate: newRange.startDate, endDate: newRange.endDate });
        setNewDates(newRange.startDate, newRange.endDate);
    }

    function rangeChange(data) {
        setSelectedRangeType(data.value);
        const range = DateOptions[data.value].data;
        setNewDates(range.startDate, range.endDate);
        setFocusedInput('startDate');
    }

    function handlePopupState() {
        if (popupOpen) setNewDates(startDate, endDate); // removes dates changes before closing (in case of a cancel)
        setPopupOpen(!popupOpen);
    }

    return (
        <Popup
            flowing
            className='date-picker'
            open={popupOpen}
            onClose={handlePopupState}
            on='click'
            style={{ height: '450px' }}
            trigger={(
                <Button icon labelPosition='left' onClick={() => handlePopupState()}>
                    {startDate ? getDateString(startDate, endDate) : 'Pick a range'}
                    <Icon name='calendar alternate' />
                </Button>
            )}
        >

            <Form>
                <Form.Dropdown
                    label='Date range'
                    value={selectedRangeType}
                    fluid
                    selection
                    selectOnBlur={false}
                    options={DateOptions}
                    data-cy='date-range-selector'
                    onChange={(_, data) => rangeChange(data)}
                />
            </Form>


            <DayPickerRangeController
                startDate={newStartDate}
                endDate={newEndDate}
                onDatesChange={dateRange => datesChange(dateRange)}
                focusedInput={focusedInput}
                onFocusChange={newFocusedInput => (
                    newFocusedInput === null ? setFocusedInput('startDate') : setFocusedInput(newFocusedInput)
                )}
                initialVisibleMonth={() => moment().subtract(1, 'M')}
                numberOfMonths={2}
                noBorder
                hideKeyboardShortcutsPanel
            />

            <Menu secondary>
                <Menu.Item>
                    <Button content='Cancel' onClick={() => handlePopupState()} />
                </Menu.Item>

                <Menu.Menu position='right'>
                    <Menu.Item>
                        <Button primary content='Confirm' onClick={() => sendNewDates()} />
                    </Menu.Item>

                </Menu.Menu>
            </Menu>
        </Popup>
    );
}


DatePicker.propTypes = {
    startDate: momentPropTypes.momentObj,
    endDate: momentPropTypes.momentObj,
    onConfirm: PropTypes.func.isRequired,
};


DatePicker.defaultProps = {
    startDate: null,
    endDate: null,
};


export default DatePicker;
