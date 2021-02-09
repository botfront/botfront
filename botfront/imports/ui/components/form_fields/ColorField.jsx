/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import connectField from 'uniforms/connectField';
import PropTypes from 'prop-types';
import { ChromePicker } from 'react-color';
import {
    Popup, Button,
} from 'semantic-ui-react';

function Color({
    value, onChange, label, id, required,
}) {
    return (
        <div className={`${required ? 'required' : ''} field`}>
            <span>
                <Popup
                    trigger={<Button className='color-pick-button' style={{ background: value }} onClick={(e) => { e.preventDefault(); }} />}
                    on='click'
                    className='no-padding-popup'
                    content={(
                        <ChromePicker
                            disableAlpha
                            id={id}
                            color={value}
                            onChangeComplete={c => onChange(c.hex)}
                        />
                    )}
                />


            </span>
            <label htmlFor={id}>{label}</label>
        </div>
    );
}


Color.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    required: PropTypes.bool,
};


Color.defaultProps = {
    required: false,
};

export default connectField(Color);
