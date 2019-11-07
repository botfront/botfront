import React          from 'react';
import classnames     from 'classnames';
import connectField   from 'uniforms/connectField';
import filterDOMProps from 'uniforms/filterDOMProps';
import {Dropdown} from "semantic-ui-react";

const xor = (item, array) => {
    const index = array.indexOf(item);
    if (index === -1) {
        return array.concat([item]);
    }

    return array.slice(0, index).concat(array.slice(index + 1));
};

handleChange = (event, selectedOption, onChange) => {
    // this.setState({ selectedOption: selectedOption.value });
    onChange(selectedOption.value)
}

const renderSelect = ({
    allowedValues,
    disable,
    id,
    inputRef,
    label,
    name,
    onChange,
    placeholder,
    required,
    transform,
    value,
    props
}) =>
    <Dropdown placeholder='Select instance'
              id={id}
              name={name}
              fluid
              search
              selection
              value={value}
              onChange={(e, {value}) => onChange(value)}
              options={props.instances.map( instance => { return {text: instance.name, key:instance._id, value:instance._id, description: instance.host}})}
              disabled={disable} />
;

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
    disable,
    ...props
}) =>
    <div className={classnames({disabled, error, required}, className, 'field')} {...filterDOMProps(props)}>
        {label && (
            <label htmlFor={id}>
                {label}
            </label>
        )}

        {/* TODO: Better handling of these props. */}
        {/* eslint-disable max-len */}
        {renderSelect({allowedValues, disabled, id, name, onChange, transform, value, inputRef, label, placeholder, required, disable, props})}
        {/* eslint-enable */}

        {!!(error && showInlineError) && (
            <div className="ui red basic pointing label">
                {errorMessage}
            </div>
        )}
    </div>
;

export default connectField(Select);
