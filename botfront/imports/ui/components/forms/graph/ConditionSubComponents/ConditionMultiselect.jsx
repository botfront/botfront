import React, { useMemo } from 'react';
import { Dropdown } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const ConditionMultiSelect = (props) => {
    const {
        setValue, value, placeholder,
    } = props;

    const options = useMemo(() => (Array.isArray(value) ? value : []).map(
        val => (
            { text: val, key: val, value: val }
        ),
    ), [value]);


    const handleChange = (_, { value: newValue }) => {
        setValue(newValue);
    };
    
    return (
        <Dropdown
            value={value || []}
            search
            selection
            options={options}
            onChange={handleChange}
            placeholder={placeholder}
            multiple
            allowAdditions
            className='condition-multiselect'
        />
    );
};

ConditionMultiSelect.propTypes = {
    value: PropTypes.array,
    setValue: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
};

ConditionMultiSelect.defaultProps = {
    placeholder: 'select an option',
    value: [],
};

export default ConditionMultiSelect;
