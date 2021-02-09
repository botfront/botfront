import React from 'react';
import PropTypes from 'prop-types';
import { Button, Popup } from 'semantic-ui-react';


const ButtonSelectField = (props) => {
    const {
        options,
        onChange,
        value,
        optionsAreExclusive,
        compact,
        className,
    } = props;

    const renderOptionButtons = () => (options).map((optionParams) => {
        const { value: buttonValue, text, description } = optionParams;
        return (
            <Popup
                key={buttonValue}
                inverted
                disabled={!description}
                trigger={(
                    <Button
                        className='option-button'
                        active={optionsAreExclusive ? value === buttonValue : value[buttonValue]}
                        onClick={(e) => {
                            e.preventDefault();
                            if (optionsAreExclusive) {
                                onChange(buttonValue);
                                return;
                            }
                            onChange(buttonValue, !value[buttonValue]);
                        }}
                    >
                        {text || buttonValue}
                    </Button>
                )}
                content={description}
            />
        );
    });
    return (
        <Button.Group
            basic
            compact={compact}
            className={`options-button-group ${className}`}
        >
            {renderOptionButtons()}
        </Button.Group>
    );
};


ButtonSelectField.propTypes = {
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any,
    optionsAreExclusive: PropTypes.bool,
    compact: PropTypes.bool,
    className: PropTypes.string,
};

ButtonSelectField.defaultProps = {
    value: {},
    optionsAreExclusive: false,
    compact: false,
    className: '',
};

export default ButtonSelectField;
