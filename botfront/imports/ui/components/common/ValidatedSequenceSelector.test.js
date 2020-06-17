import React from 'react';
import { expect } from 'chai';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount } from 'enzyme';
import ValidatedSequenceSelector from './ValidatedSequenceSelector';

if (Meteor.isClient) {
    configure({ adapter: new Adapter() });
   
      
    describe('SequenceSelector', () => {
        let sequence = null;
        let options = null;
        let sequenceSelector = null;

        function onChange(newSequence) {
            sequence = newSequence;
        }

        beforeEach(function() {
            sequence = [
                { excluded: false, name: 'action_test' },
            ];
            options = [
                { key: 'action_test', text: 'action_test', value: { excluded: false, name: 'action_test' } },
            ];
            sequenceSelector = mount(
                <ValidatedSequenceSelector
                    sequence={sequence}
                    options={options}
                    onChange={onChange}
                />,
            );
        });

        it('possible to add new step to the sequence', () => {
            sequenceSelector.find('div.sequence-addition')
                .simulate('click')
                .find('[data-cy="sequence-option-0"]').first()
                .simulate('click');

            expect(sequence).to.deep.equal([
                { excluded: false, name: 'action_test' },
                { excluded: false, name: 'action_test' },
            ]);
        });

        it('possible to exclude step from the sequence', () => {
            sequenceSelector.find('div.sequence-addition')
                .simulate('click')
                .find('[data-cy="sequence-option-0"]').first()
                .simulate('click');

            sequenceSelector.find('[data-cy="sequence-step-1"]').first()
                .simulate('click');
            expect(sequence).to.deep.equal([
                { excluded: false, name: 'action_test' },
                { excluded: true, name: 'action_test' },
            ]);
        });

        it('add step not in the options', () => {
            sequenceSelector.find('div.search > input')
                .simulate('focus')
                .simulate('change', { target: { value: 'test' } });
            sequenceSelector.find('[data-cy="add-option"]')
                .first()
                .simulate('click');

         
            expect(sequence).to.deep.equal([
                { excluded: false, name: 'action_test' },
                { excluded: false, name: 'test' },
            ]);
        });

        it('displays error when two exluded step are next to each other', () => {
            // bad sequence
            sequence = [
                { excluded: false, name: 'action_test' },
                { excluded: true, name: 'action_test' },
                { excluded: true, name: 'action_test' }];
            const sequenceSelectorWithError = mount(
                <ValidatedSequenceSelector
                    sequence={sequence}
                    options={options}
                    onChange={onChange}
                />,
            );
            // add a new elements to trigger the validation
            sequenceSelectorWithError.find('div.sequence-addition')
                .simulate('click')
                .find('[data-cy="sequence-option-0"]').first()
                .simulate('click');
            expect(sequenceSelectorWithError.find('div.negative div.item').text()).to.equal(' You cannot have two exclusion next to each other ');
        });

        it('displays error when sequence start with exluded step', () => {
            // bad sequence
            sequence = [
                { excluded: true, name: 'action_test' },
                { excluded: false, name: 'action_test' }];
            const sequenceSelectorWithError = mount(
                <ValidatedSequenceSelector
                    sequence={sequence}
                    options={options}
                    onChange={onChange}
                />,
            );
            // add a new elements to trigger the validation
            sequenceSelectorWithError.find('div.sequence-addition')
                .simulate('click')
                .find('[data-cy="sequence-option-0"]').first()
                .simulate('click');
            expect(sequenceSelectorWithError.find('div.negative div.item').text()).to.equal(' The sequence cannot start with an exclusion ');
        });
    });
}
