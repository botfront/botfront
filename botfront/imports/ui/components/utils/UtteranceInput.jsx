import React from 'react';
import { Input } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { USER_LINE_EDIT_MODE } from '../../../lib/story.utils';

function UtteranceInput({
    placeholder, size, value, onValidate, fluid, onChange, excludedTargets, onDelete,
}) {
    function testNotWhiteText() {
        const trimmedText = value.trim();
        if (trimmedText !== '' || trimmedText === USER_LINE_EDIT_MODE) {
            return trimmedText;
        }
        return false;
    }

    const excludedTarget = e => (
        // Check class of element that triggered blur against excluded classNames.
        excludedTargets.some(t => !!e.relatedTarget && e.relatedTarget.className.split(' ').includes(t))
    );

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && testNotWhiteText()) {
            onValidate();
        }
    };

    const handleOnBlur = (event) => {
        if (!excludedTarget(event) && testNotWhiteText()) {
            onValidate();
        } else {
            onDelete();
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
            onBlur={e => handleOnBlur(e)}
            autoFocus
            data-cy='utterance-input'
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
    onDelete: PropTypes.func.isRequired,
    excludedTargets: PropTypes.arrayOf(PropTypes.string),
};

UtteranceInput.defaultProps = {
    placeholder: 'Say....',
    size: 'small',
    value: '',
    onValidate: () => {},
    fluid: false,
    excludedTargets: ['trash'],
};

export default UtteranceInput;
