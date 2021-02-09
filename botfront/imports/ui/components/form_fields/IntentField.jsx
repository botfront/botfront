/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import connectField from 'uniforms/connectField';
import PropTypes from 'prop-types';
import IntentLabel from '../nlu/common/IntentLabel';

function Intent({
    value, onChange, label, id, required,
}) {
    return (
        <div className={`${required ? 'required' : ''} field`}>
            <label htmlFor={id}>{label}</label>
            <div>
                
                <IntentLabel
                    id={id}
                    value={value}
                    allowEditing
                    allowAdditions
                    onChange={i => onChange(i)}
                />
            </div>
        </div>
    );
}


Intent.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    required: PropTypes.bool,
};


Intent.defaultProps = {
    required: false,
};
   
export default connectField(Intent);
