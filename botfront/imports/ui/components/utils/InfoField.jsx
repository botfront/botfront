import React from 'react';
import PropTypes from 'prop-types';
import { AutoField } from 'uniforms-semantic';

import { Info } from './Utils';

export default function InfoField({
    name, label, info, required, Component, ...props
}) {
    return (
        <div className={`${required ? 'required ' : ''}field info-field`}>
            <label>{label}</label>
            {info && <Info info={info} />}
            <Component name={name} label={false} {...props} />
        </div>
    );
}

InfoField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    info: PropTypes.string,
    required: PropTypes.bool,
    Component: PropTypes.func,
};

InfoField.defaultProps = {
    required: true,
    info: null,
    Component: AutoField,
};
