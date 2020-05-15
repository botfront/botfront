import {
    AutoForm, AutoField, ErrorsField, SubmitField, ListAddField, ListField, ListItemField, NestField,
} from 'uniforms-semantic';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { Button } from 'semantic-ui-react';
import SimpleSchema from 'simpl-schema';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { eachTriggerValidators, hasTrigger } from '../../../../lib/storyRules.utils';
import { getModelField } from '../../../../lib/autoForm.utils';
import OptionalField from '../../form_fields/OptionalField';
import SelectField from '../../form_fields/SelectField';
import ToggleField from '../../common/ToggleField';
import { can } from '../../../../api/roles/roles';
import URLIsSequence from './URLIsSequence';
import ButtonSelectField from '../../form_fields/ButtonSelectField';


class RulesForm extends AutoForm {
    resetOptionalArray = (displayIfPath, fieldName) => {
        const resetPath = [...displayIfPath];
        resetPath[resetPath.length - 1] = fieldName;
        super.onChange(
            resetPath.join('.'),
            getModelField(resetPath.join('.'), this.props.model) || [],
        );
    }

    getDefaultValue = (field) => {
        switch (field) {
        case 'eventListeners':
            return {
                selector: '', event: null, once: false, visualization: 'none',
            };
        case 'url':
            return { partialMatch: true, path: '' };
        case 'queryString':
            return { value: '', param: '', value__DISPLAYIF: true };
        default:
            return undefined;
        }
    }
    
    addDefaultArrayField = (accessor) => {
        const key = accessor[accessor.length - 1].replace(/__DISPLAYIF/, '');
        const valueAccessor = [...accessor.slice(0, accessor.length - 1), key];
        let value = getModelField(valueAccessor.join('.'), this.props.model);
        if (!value || value.length === 0) {
            value = [this.getDefaultValue(key)];
            super.onChange(valueAccessor.join('.'), value);
        }
    }

    onChange(key, value) {
        // DESCRIPTION: handle secondary effects of model updates (eg: enabling timeOnPage disables eventListeners)
        super.onChange(key, value); // update the model with the new value
        const keyArray = key.split('.');
        const fieldName = keyArray[keyArray.length - 1]; // the last value is the name of the edited field

        if (fieldName === 'sendAsEntity') {
            // This one hides or shows the value for the query string depending on the value of sendAsEntity
            const valueDisplayIfKey = [...keyArray];
            valueDisplayIfKey[valueDisplayIfKey.length - 1] = 'value__DISPLAYIF';
            super.onChange(valueDisplayIfKey.join('.'), !value === true);
        }
        if (fieldName === 'when') {
            const whenKey = [...keyArray];
            whenKey[whenKey.length - 1] = 'triggerLimit__DISPLAYIF';
            if (value === 'limited') {
                super.onChange(whenKey.join('.'), true);
            } else {
                super.onChange(whenKey.join('.'), false);
            }
        }
        if (fieldName === 'queryString' && Array.isArray(value)) {
            // set value__DISPLAYIF fields to NOT sendAsEntity when queryString elements are added or removed
            super.onChange(key, value.map((elem = {}) => {
                if (elem.value === undefined && elem.param === undefined && elem.sendAsEntity === undefined) {
                    return { ...this.getDefaultValue(fieldName) };
                }
                return elem;
            }));
        }
        if (value === true
            && (fieldName === 'eventListeners__DISPLAYIF'
                || fieldName === 'queryString__DISPLAYIF'
                || fieldName === 'url__DISPLAYIF'
            )) {
            // when an array field is enabled, add an empty element to the array
            this.addDefaultArrayField([...keyArray]);
        }
        if (value === false) {
            // prevent errors in hidden fields
            switch (fieldName) {
            case 'eventListeners__DISPLAYIF':
                this.resetOptionalArray(keyArray, 'eventListeners');
                break;
            case 'queryString__DISPLAYIF':
                this.resetOptionalArray(keyArray, 'queryString');
                break;
            case 'url__DISPLAYIF':
                this.resetOptionalArray(keyArray, 'url');
                break;
            default:
                break;
            }
        }
    }
}

function StoryRulesForm({
    rules, onSave, deleteTriggers, projectId,
}) {
    const [enabledErrors, setEnabledErrors] = useState({});

    const getEnabledError = accessor => enabledErrors[accessor];

    const noSpaces = /^\S*$/;

    const EventListenersSchema = new SimpleSchema({
        selector: { type: String, trim: true },
        event: { type: String, trim: true },
        once: { type: Boolean, defaultValue: false },
        visualization: { type: String, defaultValue: 'none' },
    });
    
    const QueryStringSchema = new SimpleSchema({
        param: { type: String, trim: true, regEx: noSpaces },
        value: {
            type: String,
            optional: true,
            trim: true,
            regEx: noSpaces,
            custom() {
                // eslint-disable-next-line react/no-this-in-sfc
                if (this.siblingField('sendAsEntity').value || (this.value && this.value.length)) {
                    return undefined;
                }
                return SimpleSchema.ErrorTypes.REQUIRED;
            },
        },
        value__DISPLAYIF: { type: Boolean, optional: true, defaultValue: true },
        sendAsEntity: { type: Boolean, optional: true },
    });

    const TriggerSchema = new SimpleSchema({
        // NOTE:  __DISPLAYIF fields must be added to the optionalFields array
        triggerLimit: { type: Number, optional: true },
        triggerLimit__DISPLAYIF: { type: Boolean, optional: true, defaultValue: true },
        timeLimit: { type: Number, optional: true },
        timeLimit__DISPLAYIF: { type: Boolean, optional: true },
        urlIsSequence: { type: Boolean, defaultValue: false },
        url: { type: Array, optional: true },
        'url.$': { type: Object, optional: false },
        'url.$.path': { type: String, optional: false, regEx: noSpaces },
        'url.$.partialMatch': { type: Boolean, defaultValue: true },
        url__DISPLAYIF: { type: Boolean, optional: true },
        numberOfVisits: { type: Number, optional: true, min: 1 },
        numberOfVisits__DISPLAYIF: { type: Boolean, optional: true },
        numberOfPageVisits: { type: Number, optional: true, min: 1 },
        numberOfPageVisits__DISPLAYIF: { type: Boolean, optional: true },
        device: { type: String, optional: true },
        device__DISPLAYIF: { type: Boolean, optional: true },
        queryString: { type: Array, optional: true },
        'queryString.$': { type: QueryStringSchema, optional: true },
        queryString__DISPLAYIF: { type: Boolean, optional: true },
        timeOnPage: { type: Number, optional: true, min: 1 },
        timeOnPage__DISPLAYIF: { type: Boolean, optional: true },
        eventListeners: { type: Array, optional: true },
        'eventListeners.$': { type: EventListenersSchema, optional: true },
        eventListeners__DISPLAYIF: { type: Boolean, optional: true },
        when: { type: String, optional: true, defaultValue: 'always' },
    });
    
    export const RulesSchema = new SimpleSchema({
        text: { type: String, optional: true },
        text__DISPLAYIF: { type: Boolean, optional: true },
        trigger: {
            type: TriggerSchema,
            optional: true,
        },
    });
    
    export const rootSchema = new SimpleSchema({
        rules: { type: Array, optional: true, minCount: 1 },
        'rules.$': { type: RulesSchema },
        hasToggles: { type: Boolean, optional: true },
    });

    const optionalFields = [
        /*  add optional fields (ones that have an associated __DISPLAYIF) to this array
            if a field in this array is valid, a __DISPLAYIF field with the value true will be added to the model

            SEE ALSO: initializeOptionalFields
        */
        'rules.$.text',
        'rules.$.trigger.url',
        'rules.$.trigger.timeOnPage',
        'rules.$.trigger.numberOfVisits',
        'rules.$.trigger.numberOfPageVisits',
        'rules.$.trigger.device',
        'rules.$.trigger.queryString',
        'rules.$.trigger.eventListeners',
        'rules.$.trigger.queryString.$.value',
        'rules.$.trigger.triggerLimit',
        'rules.$.trigger.timeLimit',
    ];

    const fieldErrorMessages = {
        text: 'you enabled Display a user message but you did not specify a message',
        url: 'you enabled browsing history but no URLs are set',
        numberOfVisits: 'you enabled number of website visits but did not enter a value',
        numberOfPageVisits: 'you enabled number of page visits but did not enter a value',
        timeOnPage: 'you enabled time on page but did not enter a value',
        device: 'A device type must be selected when the "restrict to specific screen sizes" field is enabled',
        queryString: 'you enabled query string parameters but did not set any key-value pairs',
        eventListeners: 'you enabled event listener triggers but did not set any selector-event pairs',
        trigger: 'At least one trigger condition must be added',
        triggerLimit: 'You selected "Choose a limit" but did not specify a maximum number of tigger activations',
        timeLimit: 'you enabled minimum interval but did not enter a value',
    };

    const createPathElem = (key) => {
        const regex = /^[0-9]*$/gm;
        return key.match(regex) ? '$' : key;
    };

    const isEnabled = (field) => {
        switch (true) {
        case field === undefined || field === false:
            return false;
        case Array.isArray(field) && field.length === 0:
            return false;
        default:
            return true;
        }
    };
    
    const optionalFieldRecursion = (model, parentPath) => {
        const currentModel = model;
        const path = parentPath || '';
        Object.keys(currentModel).forEach((key) => {
            const currentPath = path.length === 0 ? key : `${path}.${createPathElem(key)}`;
            if (optionalFields.includes(currentPath) && (key === 'value' ? isEnabled(!currentModel.sendAsEntity) : isEnabled(currentModel[key]))) {
                currentModel[`${key}__DISPLAYIF`] = true;
            }
            if (key === 'when' && currentModel.when === 'limited') {
                currentModel.triggerLimit__DISPLAYIF = true;
            }
            if (typeof currentModel[key] !== 'object') return;
            currentModel[key] = optionalFieldRecursion(currentModel[key], currentPath);
        });
        return currentModel;
    };

    const initializeOptionalFields = () => {
        // add __DISPLAYIF fields to the incomming model
        if (rules.hasToggles === true) return rules;
        const activeModel = optionalFieldRecursion(rules);
        activeModel.hasToggles = true;
        if (!activeModel.rules || activeModel.rules.length < 1) {
            activeModel.rules = [{ trigger: { when: 'always' } }];
        }
        return activeModel;
    };
    
    const activeModel = initializeOptionalFields(); // add __DISPLAYIF fields to the incomming model

    const validateEnabledFields = (model) => {
        let errors = [];
        model.rules.forEach((rule, ruleIndex) => {
            if (!rule.trigger || !hasTrigger(rule.trigger)) {
                errors = [
                    ...errors,
                    { name: 'trigger', type: 'required', message: `Ruleset ${ruleIndex + 1}: ${fieldErrorMessages.trigger}` },
                ];
            }
            optionalFields.forEach((fieldName) => {
                const valueAccessor = fieldName.split('.').slice(2).join('.');
                const toggleAccessor = `${valueAccessor}__DISPLAYIF`;
                const fieldValue = getModelField(valueAccessor, rule);
                const fieldEnabled = getModelField(toggleAccessor, rule);
                const key = fieldName.split('.')[fieldName.split('.').length - 1];
                const modelAccessor = fieldName.replace(/\$/, ruleIndex);
                if (fieldEnabled && (!fieldValue || !eachTriggerValidators[key](fieldValue))) {
                    if (!enabledErrors[modelAccessor]) setEnabledErrors({ ...enabledErrors, [modelAccessor]: true });
                    errors = [
                        ...errors,
                        {
                            name: fieldName.replace(/\$/, ruleIndex),
                            type: 'required',
                            message: `Ruleset ${ruleIndex + 1}: ${fieldErrorMessages[key]}`,
                        },
                    ];
                    return;
                }
                if (enabledErrors[modelAccessor] === true) setEnabledErrors({ ...enabledErrors, [modelAccessor]: false });
            });
        });
        return errors;
    };

    const replaceRegexErrors = (error) => {
        if (/failed regular expression validation/.test(error.message)) {
            return { ...error, message: error.message.replace(/failed regular expression validation/, 'can not contain spaces') };
        }
        return error;
    };

    const filterRepeatErrors = (errors) => {
        const messages = {};
        return errors.filter((error) => {
            if (messages[error.message]) return false;
            messages[error.message] = true;
            return true;
        }).map(replaceRegexErrors);
    };

    const handleValidate = (model, incomingErrors, callback) => {
        const newError = incomingErrors || new Error('Fields are invalid');
        let errors = incomingErrors
            ? filterRepeatErrors(incomingErrors.details)
            : [];
        try {
            errors = [...errors, ...validateEnabledFields(model)];
        } catch (e) {
            errors = [...errors];
            // eslint-disable-next-line no-console
            console.log('something went wrong while validating the rules');
        }
        newError.details = errors;
        if (!newError.details.length) {
            return callback(null);
        }
        return callback(newError);
    };

    const handleDeleteClick = (e) => {
        e.preventDefault(); // prevent form submission
        deleteTriggers();
    };

    return (
        <div className='story-trigger-form-container' data-cy='story-rules-editor'>
            <RulesForm disabled={!can('triggers:w', projectId)} model={activeModel} schema={new SimpleSchema2Bridge(rootSchema)} onSubmit={onSave} onValidate={handleValidate}>
                <ListAddField name='rules.$' className='add-trigger-field' />
                <ListField name='rules' label=''>
                    <ListItemField name='$'>
                        <NestField name=''>
                            <AutoField name='trigger' label='Conditions'>
                                <ButtonSelectField
                                    name='when'
                                    label='When should this event be triggered?'
                                    options={[
                                        { value: 'always', description: 'Always' },
                                        { value: 'init', description: 'Only if no conversation has started' },
                                        { value: 'limited', description: 'Limit the number of times the rule will trigger' },
                                    ]}
                                />

                                <OptionalField
                                    name='triggerLimit'
                                    getError={getEnabledError}
                                    showToggle={false}
                                >
                                    <AutoField name='' label='Maximum number of times the rule will be triggered.' />
                                </OptionalField>
                                <OptionalField
                                    name='timeLimit'
                                    label='Minimum time between story activations by this trigger'
                                    getError={getEnabledError}
                                >
                                    <AutoField
                                        name=''
                                        label='Minimum time between story activations, in minutes.'
                                    />
                                </OptionalField>
                                <OptionalField name='url' label='Trigger based on browsing history' getError={getEnabledError}>
                                    <URLIsSequence name='' />
                                    <ListField name=''>
                                        <ListItemField name='$'>
                                            <NestField name=''>
                                                <AutoField
                                                    name='path'
                                                />
                                                <AutoField
                                                    name='partialMatch'
                                                    label='Match this page and subsequent paths'
                                                />
                                            </NestField>
                                        </ListItemField>
                                    </ListField>
                                </OptionalField>
                                <OptionalField
                                    name='numberOfVisits'
                                    label='Trigger based on the number of times the user has visited the website'
                                    data-cy='toggle-website-visits'
                                    getError={getEnabledError}
                                >
                                    <AutoField name='' label='Trigger based on number of website visits' data-cy='website-visits-input' step={1} min={0} />
                                </OptionalField>
                                <OptionalField
                                    name='numberOfPageVisits'
                                    label='Trigger based on the number of times the user has visited this specific page'
                                    data-cy='toggle-page-visits'
                                    getError={getEnabledError}
                                >
                                    <AutoField name='' label='Trigger based on number of page visits' data-cy='page-visits-input' step={1} min={0} />
                                </OptionalField>
                                    
                                <OptionalField
                                    name='queryString'
                                    label='Trigger if specific query string parameters are present in the URL'
                                    data-cy='toggle-query-string'
                                    getError={getEnabledError}
                                >
                                    <ListField name='' data-cy='query-string-field'>
                                        <ListItemField name='$'>
                                            <NestField name=''>
                                                <AutoField name='param' />
                                                <OptionalField name='value' getError={getEnabledError} showToggle={false}>
                                                    <AutoField name='' />
                                                </OptionalField>
                                                <AutoField
                                                    name='sendAsEntity'
                                                    label='If selected, the query string value will be sent as an entity with the payload'
                                                    data-cy='send-as-entity-checkbox'
                                                />
                                            </NestField>
                                        </ListItemField>
                                    </ListField>
                                </OptionalField>
                                <OptionalField
                                    name='timeOnPage'
                                    label='Trigger based on time on page'
                                    data-cy='toggle-time-on-page'
                                    getError={getEnabledError}
                                >
                                    <AutoField name='' label='Number of seconds after which this conversation should be triggered' step={1} min={0} data-cy='time-on-page-input' />
                                </OptionalField>
                                <OptionalField name='eventListeners' label='Trigger based on user actions' data-cy='toggle-event-listeners' getError={getEnabledError}>
                                    <ListField name=''>
                                        <ListItemField name='$'>
                                            <NestField name=''>
                                                <AutoField name='selector' label='CSS selector' />
                                                <SelectField
                                                    name='event'
                                                    placeholder='Select an event type'
                                                    options={[
                                                        { value: 'click', text: 'click' },
                                                        { value: 'dblclick', text: 'dblclick' },
                                                        { value: 'mouseenter', text: 'mouseenter' },
                                                        { value: 'mouseleave', text: 'mouseleave' },
                                                        { value: 'mouseover', text: 'mouseover' },
                                                        { value: 'mousemove', text: 'mousemove' },
                                                        { value: 'change', text: 'change' },
                                                        { value: 'blur', text: 'blur' },
                                                        { value: 'focus', text: 'focus' },
                                                        { value: 'focusin', text: 'focusin' },
                                                        { value: 'focusout', text: 'focusout' },
                                                    ]}
                                                />
                                                <ButtonSelectField
                                                    name='visualization'
                                                    label='Show interactivity with'
                                                    options={[
                                                        {
                                                            value: 'none',
                                                            text: 'Nothing',
                                                        },
                                                        {
                                                            value: 'questionMark',
                                                            text: 'Question mark',
                                                            description: 'Add a question mark to the top right of the target element',
                                                        },
                                                        {
                                                            value: 'pulsating',
                                                            text: 'Pulse',
                                                            description: 'The entire element will pulsate',
                                                        },
                                                        {
                                                            value: 'pulsatingDot',
                                                            text: 'Pulsating dot',
                                                            description: 'Add a pulsating circle to the top right of the target element',
                                                        },
                                                    ]}
                                                />
                                                <ToggleField name='once' label='Trigger only the first time this event occurs' />
                                            </NestField>
                                        </ListItemField>
                                    </ListField>
                                </OptionalField>
                                <OptionalField name='device' label='Restrict to a specific device type' getError={getEnabledError}>
                                    <SelectField
                                        name=''
                                        placeholder='Select device type'
                                        label='Trigger if the user is using a certain type of device'
                                        options={[
                                            { value: 'all', text: 'All' },
                                            { value: 'mobile', text: 'Mobile' },
                                            { value: 'desktop', text: 'Desktop' },
                                        ]}
                                    />
                                </OptionalField>
                            </AutoField>
                            <OptionalField name='text' label='Display a user message' data-cy='toggle-payload-text' getError={getEnabledError}>
                                <AutoField name='' label='User message to display' data-cy='payload-text-input' />
                            </OptionalField>
                        </NestField>
                    </ListItemField>
                </ListField>
                <br />
                <ErrorsField />
                <br />
                {can('triggers:w', projectId) && (
                    <div className='submit-rules-buttons' data-cy='submit-rules-buttons'>
                        <Button onClick={handleDeleteClick} basic color='red' floated='right' data-cy='delete-triggers'>Delete</Button>
                        <SubmitField value='Save and exit' className='right floated blue' data-cy='submit-triggers' />
                    </div>
                )}
            </RulesForm>
        </div>
    );
}

StoryRulesForm.propTypes = {
    rules: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    deleteTriggers: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
};

StoryRulesForm.defaultProps = {
    rules: { rules: [] },
};

export default StoryRulesForm;
