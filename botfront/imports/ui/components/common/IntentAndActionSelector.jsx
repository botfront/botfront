

import React from 'react';
import PropTypes from 'prop-types';
import {
    Segment,
    Dropdown,

} from 'semantic-ui-react';
import SequenceSelector from './SequenceSelector';

const IntentAndActionSelector = ({
    operatorValue,
    slotOptions,
    actionOptions,
    onChange,
    operatorChange,
    sequence,
    allowedOperators,
}) => {
    const getOperatorOptions = () => {
        const allOptions = [
            {
                key: 'and', value: 'and', text: 'And',
            },
            {
                key: 'or', value: 'or', text: 'Or',
            },
            {
                key: 'inOrder', value: 'inOrder', text: 'In order',
            },
        ];
        return allOptions.filter(({ key }) => allowedOperators.includes(key));
    };
    return (
        <Segment.Group className='multiselect-exlcusions' horizontal>
            <Segment className='multiselect-segment'>
                <SequenceSelector
                    onChange={(value) => {
                        onChange(value);
                    }}
                    actionOptions={actionOptions}
                    slotOptions={slotOptions}
                    sequence={sequence}
                />
            </Segment>
            <Segment compact className='and-or-order-segment'>
                <Dropdown
                    className='and-or-order'
                    fluid
                    selection
                    onChange={(e, { value }) => { operatorChange(value); }}
                    value={operatorValue}
                    options={getOperatorOptions()}
                />
            </Segment>
        </Segment.Group>
    );
};

IntentAndActionSelector.propTypes = {
    sequence: PropTypes.array.isRequired,
    actionOptions: PropTypes.array,
    slotOptions: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    operatorChange: PropTypes.func.isRequired,
    operatorValue: PropTypes.string,
    allowedOperators: PropTypes.array,
};

IntentAndActionSelector.defaultProps = {
    operatorValue: 'or',
    allowedOperators: ['and', 'or', 'inOrder'],
    actionOptions: [],
    slotOptions: [],
};


export default IntentAndActionSelector;
