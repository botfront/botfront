import React from 'react';
import PropTypes from 'prop-types';
import { Button, Popup } from 'semantic-ui-react';
import connectField from 'uniforms/connectField';


const ButtonSelectField = (props) => {
    const {
        options,
        label,
        onChange,
        value,
    } = props;

    const handleClickOption = ({ value: optionValue }) => {
        onChange(optionValue);
    };

    const renderOptionButtons = () => (options).map((optionParams) => {
        const { value: optionValue, text, description } = optionParams;
        return (
            <Popup
                key={`button-item-${optionValue}`}
                inverted
                disabled={!description}
                trigger={(
                    <Button
                        className='option-button'
                        active={optionValue === value}
                        onClick={(e) => {
                            e.preventDefault();
                            handleClickOption(optionParams);
                        }}
                    >
                        {text || optionValue}
                    </Button>
                )}
                content={description}
            />
        );
    });
    return (
        <div className='field'>
            <label className='button-select-label'>{label}</label>
            <Button.Group
                basic
                className='options-button-group'
            >
                {renderOptionButtons()}
            </Button.Group>
        </div>
    );
};


ButtonSelectField.propTypes = {
    options: PropTypes.array.isRequired,
    label: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any,
};

ButtonSelectField.defaultProps = {
    label: null,
    value: null,
};

export default connectField(ButtonSelectField);
