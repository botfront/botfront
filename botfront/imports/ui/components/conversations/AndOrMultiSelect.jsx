

import React from 'react';
import PropTypes from 'prop-types';
import {
    Segment,
    Dropdown,

} from 'semantic-ui-react';


const AndOrMultiselect = ({
    values,
    operatorValue,
    addItem,
    options,
    onChange,
    placeholder,
    operatorChange,
    allowAdditions,
}) => (
    <Segment.Group className='multiselect-andor' horizontal>
        <Segment className='multiselect-segment'>
            <Dropdown
                className='filter-dropdown multi-select'
                placeholder={placeholder}
                fluid
                multiple
                search
                selection
                onChange={(e, { value }) => {
                    onChange(value);
                }}
                value={values}
                additionLabel='Add: '
                {...(allowAdditions ? { noResultsMessage: 'Type to add filters' } : {})}
                allowAdditions={allowAdditions}
                onAddItem={(_, { value }) => addItem(value)}
                options={options}
            />
        </Segment>
        <Segment className='andor-segment'>
            <Dropdown
                className='andor'
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
                    }]}
            />
        </Segment>
    </Segment.Group>
);
AndOrMultiselect.propTypes = {
    values: PropTypes.array.isRequired,
    addItem: PropTypes.func,
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    operatorChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    allowAdditions: PropTypes.bool,
    operatorValue: PropTypes.string,
};

AndOrMultiselect.defaultProps = {
    addItem: () => {},
    placeholder: '',
    allowAdditions: false,
    operatorValue: 'or',
};


export default AndOrMultiselect;
