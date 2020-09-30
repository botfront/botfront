import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'semantic-ui-react';

const StrictNumberInput = (props) => {
    const {
        value, onChange, onBlur, fallbackValue, disabled, placeholder, min, max,
    } = props;

    const [localValue, setLocalValue] = useState(null);
    const [dbValue, setDbValue] = useState(value);
    const validLocalValue = localValue === '' || (localValue && localValue.length > 0);

    const handleOnChange = (newValue) => {
        setDbValue(newValue);
        onChange(newValue);
    };

    return (
        <Input
            placeholder={placeholder}
            value={validLocalValue ? localValue : dbValue}
            disabled={disabled}
            type={validLocalValue ? 'text' : 'number'}
            onKeyPress={(e) => {
                if (e.key === '-') {
                    if (validLocalValue) {
                        setLocalValue('-');
                        e.preventDefault();
                    } else {
                        setLocalValue(null);
                        handleOnChange(value * -1);
                        e.preventDefault();
                    }
                }
                if (e.key === 'e') {
                    // blocked as it clears the input when typed
                    e.preventDefault();
                }
                if (e.key === '.' && /\./.test(value)) {
                    e.preventDefault();
                }
            }}
            onChange={(_, data) => {
                const { value: newValue } = data;
                if (newValue === '') {
                    setLocalValue('');
                    onChange(fallbackValue);
                    return;
                }
                setLocalValue(null);
                const parsedNewValue = parseFloat(newValue, 10);
                handleOnChange(Number.isNaN(parsedNewValue) ? 0 : parsedNewValue);
            }}
            onBlur={() => {
                if ((min || min === 0) && value < min) handleOnChange(min);
                if ((max || max === 0) && value > max) handleOnChange(max);
                setLocalValue(null);
                onBlur();
            }}
        />
    );
};

StrictNumberInput.propTypes = {
    value: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    fallbackValue: PropTypes.any,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
};

StrictNumberInput.defaultProps = {
    value: null,
    onBlur: () => {},
    fallbackValue: null,
    disabled: false,
    placeholder: '',
    min: null,
    max: null,
};

export default StrictNumberInput;
