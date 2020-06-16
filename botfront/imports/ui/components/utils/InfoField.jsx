import React from 'react';
import PropTypes from 'prop-types';
import { AutoField } from 'uniforms-semantic';
import { Info } from '../common/Info';

export default function InfoField({
    name,
    label,
    info,
    required,
    Component,
    disabled,
    ...props
}) {
    const requiredClass = required ? 'required' : '';
    const disabledClass = disabled ? 'disabled' : '';
    return (
        <div className={`${requiredClass} ${disabledClass} field info-field`}>
            <Component
                name={name}
                label={(
                    <>
                        {label}
                        {info && <Info info={info} />}
                    </>
                )}
                disabled
                {...props}
            />
        </div>
    );
}

InfoField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    info: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    Component: PropTypes.func,
};

InfoField.defaultProps = {
    required: true,
    disabled: false,
    info: null,
    Component: AutoField,
};
