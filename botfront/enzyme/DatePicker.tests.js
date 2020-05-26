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
                .find({ 'data-cy': 'apply-new-dates' })
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
                .find({ 'data-cy': 'apply-new-dates' })
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
                startDate: moment().subtract(6, 'days'),
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
                .subtract(6, 'days')
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
                .find({ 'data-cy': 'apply-new-dates' })
                .simulate('click');
            // use moment().format to fuzzy match the date
            expect(startDate.format('DD MMM YYYY')).to.equal(
                moment()
                    .subtract(29, 'days')
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
                .find({ 'data-cy': 'apply-new-dates' })
                .simulate('click');

            /* warpper.update() is not working for re-rendering
            we use setProps to force the re-render */
            DatePickerComponent.setProps({ startDate, endDate, onConfirm });

            expect(DatePickerComponent.find('Popup')
                .prop('trigger').props.children[0]).to.equal(`${moment()
                .subtract(29, 'days')
                .format('DD/MM/YYYY')} - ${moment()
                .format('DD/MM/YYYY')}`);
        });
        
        it('should be able to select a single day', () => {
            const incomingRange = {
                startDate: moment(),
                endDate: null,
            };
            const expectedRange = {
                startDate: moment().startOf('day'),
                endDate: moment().endOf('day'),
            };
            // trigger date change
            DatePickerComponent
                .find('DayPickerRangeController')
                .prop('onDatesChange')(incomingRange);
            DatePickerComponent.find('Button')
                .find({ 'data-cy': 'apply-new-dates' })
                .simulate('click');
            // check state start and end dates match expectations
            expect(startDate.toISOString()).to.have.string(
                expectedRange.startDate.toISOString(),
            );
            expect(endDate.toISOString()).to.have.string(
                expectedRange.endDate.toISOString(),
            );
        });

        it('should persist custom range', () => {
            const customRange = { startDate: moment().subtract(25, 'days'), endDate: moment() };
            // set a custom range
            DatePickerComponent
                .find('DayPickerRangeController')
                .prop('onDatesChange')(customRange);
            DatePickerComponent.find('Button')
                .find({ 'data-cy': 'apply-new-dates' })
                .simulate('click');
            // switch to a preset range
            DatePickerComponent.find('FormDropdown')
                .dive() // the component form field
                .dive() // the component label and dropdown
                .find('Dropdown')
                .prop('onChange')(null, { value: 2 });
            DatePickerComponent.find('Button')
                .find({ 'data-cy': 'apply-new-dates' })
                .simulate('click');
            // switch back to the custom range
            DatePickerComponent.find('FormDropdown')
                .dive() // the component form field
                .dive() // the component label and dropdown
                .find('Dropdown')
                .prop('onChange')(null, { value: 0 });
            DatePickerComponent.find('Button')
                .find({ 'data-cy': 'apply-new-dates' })
                .simulate('click');
            expect(startDate.format('DD MM YY'))
                .to.have.string(
                    customRange.startDate.format('DD MM YY'),
                );
            expect(endDate.format('DD MM YY'))
                .to.have.string(
                    customRange.endDate.format('DD MM YY'),
                );
        });
    });
}
