import React from 'react';
import { Input } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import StrictNumberInput from '../../../common/StrictNumberInput';


const ConditionInput = (props) => {
    const {
        value, setValue, placeholder, inputType, min, max, className,
    } = props;

    return inputType === 'number'
        ? (
            <StrictNumberInput
                onChange={newValue => setValue(newValue)}
                fallbackValue={null}
                value={value}
                placeholder={placeholder}
                min={min}
                max={max}
            />
        )
        : (
            <Input
                className={`condition-input ${className}`}
                onChange={(_, { value: newValue }) => setValue(newValue)}
                value={value}
                placeholder={placeholder}
            />
        );
};

ConditionInput.propTypes = {
    value: PropTypes.any,
    setValue: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    inputType: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    className: PropTypes.string,
};

ConditionInput.defaultProps = {
    value: '',
    placeholder: 'Enter a value',
    inputType: 'text',
    min: null,
    max: null,
    className: '',
};

export default ConditionInput;
