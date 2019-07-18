import React, { useState } from 'react';
import { Input } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const handleOnChange = (data, changeText) => {
    changeText(data.value);
};

const handleKeyDown = (event, onValidate, text) => {
    const trimmedText = text.trim();
    if (event.key === 'Enter' && trimmedText !== '') {
        onValidate(trimmedText);
    }
};

const handleOnBlur = (onValidate, text) => {
    const trimmedText = text.trim();
    if (trimmedText !== '') {
        onValidate(trimmedText);
    }
};

function UtteranceInput({
    placeholder, size, value, onValidate, fluid,
}) {
    const [text, changeText] = useState(value);
    return (
        <Input
            value={text}
            placeholder={placeholder}
            size={size}
            fluid={fluid}
            onChange={(e, data) => handleOnChange(data, changeText)}
            onKeyDown={e => handleKeyDown(e, onValidate, text)}
            onBlur={() => handleOnBlur(onValidate, text)}
        />
    );
}

UtteranceInput.propTypes = {
    placeholder: PropTypes.string,
    size: PropTypes.string,
    value: PropTypes.string,
    onValidate: PropTypes.func,
    fluid: PropTypes.bool,
};

UtteranceInput.defaultProps = {
    placeholder: 'Say....',
    size: 'mini',
    value: '',
    onValidate: () => {},
    fluid: false,
};

export default UtteranceInput;
