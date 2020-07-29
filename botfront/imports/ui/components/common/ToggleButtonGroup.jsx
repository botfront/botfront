import React from 'react';
import PropTypes from 'prop-types';
import { Button, Popup } from 'semantic-ui-react';


const ButtonSelectField = (props) => {
    const {
        options,
        onChange,
        values,
    } = props;

    const renderOptionButtons = () => (options).map((optionParams) => {
        const { value, text, description } = optionParams;
        return (
            <Popup
                key={value}
                inverted
                disabled={!description}
                trigger={(
                    <Button
                        className='option-button'
                        active={values[value]}
                        onClick={(e) => {
                            e.preventDefault();
                            onChange(value, !values[value]);
                        }}
                    >
                        {text || value}
                    </Button>
                )}
                content={description}
            />
        );
    });
    return (
        <Button.Group
            basic
            className='options-button-group'
        >
            {renderOptionButtons()}
        </Button.Group>
    );
};


ButtonSelectField.propTypes = {
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    values: PropTypes.any,
};

ButtonSelectField.defaultProps = {
    values: {},
};

export default ButtonSelectField;
