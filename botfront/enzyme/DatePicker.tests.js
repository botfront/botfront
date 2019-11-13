import React from 'react';
import { expect } from 'chai';
import Adapter from 'enzyme-adapter-react-16';
import { configure, shallow } from 'enzyme';
import moment from 'moment';
import DatePicker from '../imports/ui/components/common/DatePicker';

if (Meteor.isClient) {
    configure({ adapter: new Adapter() });

    describe('DatePicker', () => {
        let startDate = null;
        let endDate = null;
        let DatePickerComponent = null;

        function onConfirm(newStartDate, newEndDate) {
            startDate = newStartDate;
            endDate = newEndDate;
        }

        beforeEach(function() {
            startDate = null;
            endDate = null;
            DatePickerComponent = shallow(
                <DatePicker
                    startDate={startDate}
                    endDate={endDate}
                    onConfirm={onConfirm}
                />,
            );
        });

        it('triggering the button should change the open prop of the popup', () => {
            DatePickerComponent.find('Popup')
                .prop('trigger')
                .props.onClick();
            expect(DatePickerComponent.find('Popup').prop('open')).to.equal(true);
        });

        it('should not change parent state when confirm without change ', () => {
            DatePickerComponent.find('Button')
                .find({ content: 'Confirm' })
                .simulate('click');
            expect(startDate).to.equal(null);
            expect(endDate).to.equal(null);
        });

        it('should not change parent state when cancel with change', () => {
            DatePickerComponent.find('DayPickerRangeController').prop('onDatesChange')({
                startDate: moment().subtract(4, 'days'),
                endDate: moment(),
            });
            DatePickerComponent.find('Button')
                .find({ content: 'Cancel' })
                .simulate('click');
            // use moment().format to fuzzy match the date
            expect(startDate).to.equal(null);
            expect(endDate).to.equal(null);
        });

        it('should change parent state when confirm with change', () => {
            DatePickerComponent.find('DayPickerRangeController').prop('onDatesChange')({
                startDate: moment().subtract(4, 'days'),
                endDate: moment(),
            });
            DatePickerComponent.find('Button')
                .find({ content: 'Confirm' })
                .simulate('click');
            // use moment().format to fuzzy match the date
            expect(startDate.format('DD MMM YYYY')).to.equal(
                moment()
                    .subtract(4, 'days')
                    .format('DD MMM YYYY'),
            );
            expect(endDate.format('DD MMM YYYY')).to.equal(
                moment().format('DD MMM YYYY'),
            );
        });

        it('should change dropdown text when changing date', () => {
            DatePickerComponent.find('DayPickerRangeController').prop('onDatesChange')({
                startDate: moment().subtract(7, 'days'),
                endDate: moment(),
            });
            expect(
                DatePickerComponent.find('FormDropdown')
                    .dive() // the component form field
                    .dive() // the component label and dropdown
                    .find('Dropdown')
                    .dive()
                    .find('.text')
                    .text(),
            ).to.equal(`Custom: ${moment()
                .subtract(7, 'days')
                .format('DD MMM YYYY')} - ${moment()
                .format('DD MMM YYYY')}`);
        });

        it('should not change dates using the dropdown after a cancel', () => {
            DatePickerComponent.find('FormDropdown')
                .dive() // the component form field
                .dive() // the component label and dropdown
                .find('Dropdown')
                .prop('onChange')(null, { value: 2 });
            DatePickerComponent.find('Button')
                .find({ content: 'Cancel' })
                .simulate('click');
            // use moment().format to fuzzy match the date
            expect(startDate).to.equal(null);
            expect(endDate).to.equal(null);
        });


        it('should change dates using the dropdown after a confirm', () => {
            DatePickerComponent.find('FormDropdown')
                .dive() // the component form field
                .dive() // the component label and dropdown
                .find('Dropdown')
                .prop('onChange')(null, { value: 2 });
            DatePickerComponent.find('Button')
                .find({ content: 'Confirm' })
                .simulate('click');
            // use moment().format to fuzzy match the date
            expect(startDate.format('DD MMM YYYY')).to.equal(
                moment()
                    .subtract(30, 'days')
                    .format('DD MMM YYYY'),
            );
            expect(endDate.format('DD MMM YYYY')).to.equal(
                moment().format('DD MMM YYYY'),
            );
        });

        it('should change the button display after a confirm', () => {
            DatePickerComponent.find('FormDropdown')
                .dive() // the component form field
                .dive() // the component label and dropdown
                .find('Dropdown')
                .prop('onChange')(null, { value: 2 });
            DatePickerComponent.find('Button')
                .find({ content: 'Confirm' })
                .simulate('click');

            /* warpper.update() is not working for re-rendering
            we use setProps to force the re-render */
            DatePickerComponent.setProps({ startDate, endDate, onConfirm });

            expect(DatePickerComponent.find('Popup')
                .prop('trigger').props.children[0]).to.equal(`${moment()
                .subtract(30, 'days')
                .format('DD MMM YYYY')} - ${moment()
                .format('DD MMM YYYY')}`);
        });
        
        it('should be able to select a single day', () => {
            const incomingRange = { startDate: moment(), endDate: null };
            const expectedRange = { startDate: moment().startOf('day'), endDate: moment().endOf('day') };
            DatePickerComponent.find('DayPickerRangeController').prop('onDatesChange')(incomingRange);
            DatePickerComponent.find('Button')
                .find({ content: 'Confirm' })
                .simulate('click');
            expect(startDate.toISOString()).to.have.string(expectedRange.startDate.toISOString());
            expect(endDate.toISOString()).to.have.string(expectedRange.endDate.toISOString());
        });
    });
}
