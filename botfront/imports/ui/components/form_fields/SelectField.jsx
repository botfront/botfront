/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable react/prop-types */
import React from 'react';
import classnames from 'classnames';
import connectField from 'uniforms/connectField';
import filterDOMProps from 'uniforms/filterDOMProps';
import { Dropdown } from 'semantic-ui-react';

const getOptions = (allowedValues, props = {}) => {
    const { options } = props;
    if (options) return options;
    return allowedValues.map(val => ({ text: val, value: val }));
};

const renderCheckboxes = ({
    allowedValues, placeholder, disabled, fieldType, id, name, onChange, transform, value,
}) => (
    <Dropdown
        placeholder={placeholder}
        multiple
        search
        value={value}
        selection
        onChange={(e, { value }) => onChange(value)}
        options={getOptions(allowedValues)}
    />
);

const renderSelect = ({
    // eslint-disable-next-line no-unused-vars
    allowedValues,
    disabled,
    id,
    inputRef,
    label,
    name,
    onChange,
    placeholder,
    required,
    transform,
    value,
    props,
}) => (
    <Dropdown
        placeholder={placeholder}
        search
        value={value}
        selection
        onChange={(e, { value }) => onChange(value)}
        options={getOptions(allowedValues, props)}
    />
);

const Select = ({
    allowedValues,
    checkboxes,
    className,
    disabled,
    error,
    errorMessage,
    fieldType,
    id,
    inputRef,
    label,
    name,
    onChange,
    placeholder,
    required,
    showInlineError,
    transform,
    value,
    ...props
}) => (
    <div className={classnames({ disabled, error, required }, className, 'field')} {...filterDOMProps(props)}>
        {label && <label htmlFor={id}>{label}</label>}

        {/* TODO: Better handling of these props. */}
        {checkboxes || fieldType === Array
            ? renderCheckboxes({
                allowedValues,
                disabled,
                id,
                name,
                onChange,
                transform,
                placeholder,
                value,
                fieldType,
                props,
            })
            : renderSelect({
                allowedValues,
                disabled,
                id,
                name,
                onChange,
                transform,
                value,
                inputRef,
                label,
                placeholder,
                required,
                props,
            })}

        {!!(error && showInlineError) && <div className='ui red basic pointing label'>{errorMessage}</div>}
    </div>
);
export default connectField(Select);
