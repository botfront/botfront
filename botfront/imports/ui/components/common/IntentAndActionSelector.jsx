

import React from 'react';
import PropTypes from 'prop-types';
import {
    Segment,
    Dropdown,

} from 'semantic-ui-react';
import SequenceSelector from './SequenceSelector';

const IntentAndActionSelector = ({
    operatorValue,
    options,
    onChange,
    operatorChange,
    sequence,
}) => (
    <Segment.Group className='multiselect-exlcusions' horizontal>
        <Segment className='multiselect-segment'>
            <SequenceSelector
                onChange={(value) => {
                    onChange(value);
                }}
                options={options}
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
                options={[
                    {
                        key: 'and', value: 'and', text: 'And',
                    },
                    {
                        key: 'or', value: 'or', text: 'Or',
                    },
                    {
                        key: 'inOrder', value: 'inOrder', text: 'In order',
                    }]
                }
            />
        </Segment>
    </Segment.Group>
);
IntentAndActionSelector.propTypes = {
    sequence: PropTypes.array.isRequired,
   
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    operatorChange: PropTypes.func.isRequired,

    operatorValue: PropTypes.string,
    
       
};

IntentAndActionSelector.defaultProps = {
    operatorValue: 'or',
};


export default IntentAndActionSelector;
