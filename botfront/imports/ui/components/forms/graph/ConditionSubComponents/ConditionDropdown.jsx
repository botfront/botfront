import React, { useMemo } from 'react';
import { Dropdown } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const ConditionDropdown = (props) => {
    const {
        items, setField, selectedPath, placeholder,
    } = props;
    const options = useMemo(() => items.map(
        ({ label, key }) => (
            { text: label, key, value: key }
        ),
    ), [items]);

    const handleChange = (_, { value }) => {
        setField(value);
    };
    
    return (
        <Dropdown
            value={selectedPath ? selectedPath[0] : null}
            search
            selection
            options={options}
            onChange={handleChange}
            placeholder={placeholder}
        />
    );
};

ConditionDropdown.propTypes = {
    items: PropTypes.array.isRequired,
    setField: PropTypes.func.isRequired,
    selectedPath: PropTypes.array,
    placeholder: PropTypes.string,
};

ConditionDropdown.defaultProps = {
    selectedPath: null,
    placeholder: 'select an option',
};

export default ConditionDropdown;
