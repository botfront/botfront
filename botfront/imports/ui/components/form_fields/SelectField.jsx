/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import classnames from 'classnames';
import connectField from 'uniforms/connectField';
import filterDOMProps from 'uniforms/filterDOMProps';
import {
    Dropdown, Label, Icon, Popup,
} from 'semantic-ui-react';
import ConfirmPopup from '../common/ConfirmPopup';

const getOptions = (allowedValues, props = {}) => {
    const { options } = props;
    if (options) return options;
    return allowedValues.map(val => ({ text: val, value: val }));
};

const renderCheckboxes = ({
    allowedValues, placeholder, disabled, fieldType, id, name, onChange, transform, value, confirmDeletions, props,
}) => {
    const [popupOpen, setPopupOpen] = useState(null);
    const renderLabel = (props, i) => {
        const { text, value: labelValue } = props;
        return (
            <Label key={`label-${labelValue}-${i}`}>
                {text}
                <Popup
                    open={popupOpen === i}
                    on='click'
                    content={(
                        <ConfirmPopup
                            title={`Remove ${text} from this form?`}
                            description='This will delete all the slot settings associated with this form'
                            onYes={() => {
                                setPopupOpen(null);
                                if (!Array.isArray()) onChange([labelValue]);
                                const newValue = [...value.slice(0, i), ...value.slice(i + 1, value.length)];
                                onChange(newValue);
                            }}
                            onNo={() => setPopupOpen(null)}
                        />
                    )}
                    trigger={(<Icon name='close' onClick={() => setPopupOpen(i)} />)}
                />
            </Label>
        );
    };
    return (
        <Dropdown
            placeholder={placeholder}
            multiple
            search
            value={value}
            selection
            {...(confirmDeletions ? { renderLabel } : {})}
            onChange={(e, { value }) => onChange(value)}
            options={getOptions(allowedValues, props)}
        />
    );
};

const renderSelect = ({
    // eslint-disable-next-line no-unused-vars
    allowedValues,
    onChange,
    placeholder,
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
    confirmDeletions,
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
                confirmDeletions,
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
