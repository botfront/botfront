import 'react-dates/initialize';
import moment from 'moment';
import { DayPickerRangeController } from 'react-dates';
import React, { useState } from 'react';
import {
    Popup, Button, Icon, Form, Menu, Dropdown,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';

function DatePicker({
    startDate, endDate, onConfirm, onConfirmForAll, position, placeholder,
}) {
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

    function sendNewDates(all = false) {
        const func = all ? onConfirmForAll : onConfirm;
        func(newStartDate, newEndDate, all);
        setPopupOpen(!popupOpen);
    }
    /* the value field should is the array index of the object
     it is used to get the data field after a selection in the dropdown
     the dropdown does not support objects in its value so this a workaround */

    const getCustomRangeText = () => {
        if ((customRange.startDate || startDate) || (customRange.endDate || endDate)) {
            return `Custom: ${getDateString(customRange.startDate || startDate, customRange.endDate || endDate)}`;
        }
        return 'Pick a range';
    };
    const DateOptions = [
        {
            key: 'custom',
            text: getCustomRangeText(),
            value: 0,
            data: { startDate: customRange.startDate || startDate, endDate: customRange.endDate || endDate },
        },
        {
            key: 'seven',
            text: 'Last 7 days',
            value: 1,
            data: { startDate: moment().subtract(6, 'days').startOf('day'), endDate: moment().endOf('day') },
        },
        {
            key: 'thirty',
            text: 'Last 30 days',
            value: 2,
            data: { startDate: moment().subtract(29, 'days').startOf('day'), endDate: moment().endOf('day') },
        },
        {
            key: 'ninety',
            text: 'Last 90 days',
            value: 3,
            data: { startDate: moment().subtract(89, 'days').startOf('day'), endDate: moment().endOf('day') },
        },
    ];

    function datesChange(incomingRange) {
        const newRange = incomingRange;
        if (!newRange.endDate) { // selection has a range of one day
            newRange.endDate = moment(newRange.startDate.endOf('day'));
            newRange.startDate = moment(newRange.startDate.startOf('day'));
        } else {
            newRange.endDate = moment(newRange.endDate.endOf('day'));
            newRange.startDate = moment(newRange.startDate.startOf('day'));
        }
        setSelectedRangeType(0); // if there is date change, the range type is always custom (index 0)
        setCustomRange({ startDate: newRange.startDate, endDate: newRange.endDate });
        setNewDates(newRange.startDate, newRange.endDate);
    }

    function rangeChange(data) {
        setSelectedRangeType(data.value);
        const range = DateOptions[data.value].data;
        setNewDates(moment(range.startDate.startOf('day')), moment(range.endDate.endOf('day')));
        setFocusedInput('startDate');
    }

    function handlePopupState() {
        if (popupOpen) setNewDates(moment(startDate).startOf('day'), moment(endDate).endOf('day')); // removes dates changes before closing (in case of a cancel)
        setPopupOpen(!popupOpen);
    }

    return (
        <Popup
            flowing
            position={position}
            // pinned={!!position}
            className='date-picker'
            open={popupOpen}
            onClose={handlePopupState}
            on='click'
            style={{ height: '450px' }}
            trigger={(
                <Button icon labelPosition='left' onClick={() => handlePopupState()}>
                    {startDate ? getDateString(startDate, endDate) : placeholder || 'Pick a range'}
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
                        <Button.Group primary>
                            <Button data-cy='apply-new-dates' content='Apply' onClick={() => sendNewDates()} />
                            {onConfirmForAll && (
                                <Dropdown
                                    className='button icon'
                                    floating
                                    options={[{
                                        key: 'apply-new-dates-to-all',
                                        'data-cy': 'apply-new-dates-to-all',
                                        text: 'Apply to all cards',
                                        onClick: () => sendNewDates(true),
                                    }]}
                                    trigger={<React.Fragment />}
                                />
                            )}
                        </Button.Group>
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
    onConfirmForAll: PropTypes.func,
    position: PropTypes.string,
    placeholder: PropTypes.string,
};


DatePicker.defaultProps = {
    startDate: null,
    endDate: null,
    position: null,
    onConfirmForAll: null,
    placeholder: null,
};


export default DatePicker;
