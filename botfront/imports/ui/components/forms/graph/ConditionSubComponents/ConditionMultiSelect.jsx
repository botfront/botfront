import React, { useMemo } from 'react';
import { Dropdown } from 'semantic-ui-react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-cycle
import { parsePypredCollections, formatValue } from '../../../../../lib/pypred/pypred.utils';

const ConditionMultiSelect = (props) => {
    const {
        setValue, value, placeholder,
    } = props;

    const options = useMemo(() => (parsePypredCollections(value)).map(
        val => (
            { text: val, key: val, value: val }
        ),
    ), [value]);


    const handleChange = (_, { value: newValue }) => {
        let valueFormatted = newValue.map(val => formatValue(val));
        valueFormatted = `{${valueFormatted.join(' ')}}`;
        setValue(valueFormatted);
    };

    return (
        <Dropdown
            value={parsePypredCollections(value)}
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
    value: '{}',
};

export default ConditionMultiSelect;
