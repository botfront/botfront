/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import connectField from 'uniforms/connectField';
import PropTypes from 'prop-types';


function Static({
    value, label,
}) {
    return (
        <div>
            <span> {label} </span> {value}
        </div>
    );
}


Static.propTypes = {
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
};

export default connectField(Static);
