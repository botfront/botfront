import React from 'react';
import { Input } from 'semantic-ui-react';
import PropTypes from 'prop-types';

function UtteranceInput({
    placeholder, size, value, onValidate, fluid, onChange,
}) {
    function testWhiteText() {
        const trimmedText = value.trim();
        if (trimmedText !== '') {
            return trimmedText;
        }
        return false;
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && testWhiteText()) {
            onValidate();
        }
    };

    const handleOnBlur = () => {
        if (testWhiteText()) {
            onValidate();
        }
    };
    return (
        <Input
            value={value}
            placeholder={placeholder}
            size={size}
            fluid={fluid}
            onChange={(_e, data) => onChange(data.value)}
            onKeyDown={e => handleKeyDown(e)}
            onBlur={() => handleOnBlur()}
        />
    );
}

UtteranceInput.propTypes = {
    placeholder: PropTypes.string,
    size: PropTypes.string,
    value: PropTypes.string,
    onValidate: PropTypes.func,
    fluid: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
};

UtteranceInput.defaultProps = {
    placeholder: 'Say....',
    size: 'mini',
    value: '',
    onValidate: () => {},
    fluid: false,
};

export default UtteranceInput;
