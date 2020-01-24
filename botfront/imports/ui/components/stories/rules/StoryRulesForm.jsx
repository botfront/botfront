import React from 'react';
import PropTypes from 'prop-types';
// import { GraphQLBridge } from 'uniforms-bridge-graphql';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import SimpleSchema from 'simpl-schema';
import {
    AutoForm, AutoField, ErrorsField, SubmitField, ListDelField,
} from 'uniforms-semantic';

import SelectField from '../../form_fields/SelectField';
import OptionalField from '../../form_fields/OptionalField';

import { getModelField } from '../../../../lib/autoForm.utils';

class RulesForm extends AutoForm {
    resetOptionalArray = (keyArray, fieldName) => {
        const eventListenersValueKey = [...keyArray];
        eventListenersValueKey[eventListenersValueKey.length - 1] = fieldName;
        super.onChange(
            eventListenersValueKey.join('.'),
            getModelField(eventListenersValueKey.join('.'), this.props.model) || [],
        );
    }

    onChange(key, value) {
        super.onChange(key, value);
        const keyArray = key.split('.');
        if (keyArray[keyArray.length - 1] === 'timeOnPage__DISPLAYIF' && value === true) {
            // disabled the eventListener field when timeOnPage is enabled
            const eventListenersBoolKey = [...keyArray];
            eventListenersBoolKey[eventListenersBoolKey.length - 1] = 'eventListeners__DISPLAYIF';
            super.onChange(eventListenersBoolKey.join('.'), false);
            this.resetOptionalArray(keyArray, 'eventListeners');
        }
        if (keyArray[keyArray.length - 1] === 'eventListeners__DISPLAYIF' && value === true) {
            // disabled the timeOnPage field when eventListener field is enabled
            const timeOnPageBoolKey = [...keyArray];
            timeOnPageBoolKey[timeOnPageBoolKey.length - 1] = 'timeOnPage__DISPLAYIF';
            super.onChange(timeOnPageBoolKey.join('.'), false);
        }
        if (value === false) {
            // prevent errors in hidden fields
            switch (keyArray[keyArray.length - 1]) {
            case 'eventListeners__DISPLAYIF':
                this.resetOptionalArray(keyArray, 'eventListeners');
                break;
            case 'queryString__DISPLAYIF':
                this.resetOptionalArray(keyArray, 'queryString');
                break;
            default:
                break;
            }
        }
    }
}

function StoryRulesForm({
    rules, onChange, saveAndExit,
}) {
    const EventListenersSchema = new SimpleSchema({
        selector: { type: String, trim: true },
        event: { type: String, trim: true },
        once: { type: Boolean },
    });
    
    const QueryStringSchema = new SimpleSchema({
        param: { type: String, trim: true },
        value: { type: String, trim: true },
    });
    
    const TriggerSchema = new SimpleSchema({
        url: { type: Array, optional: true },
        'url.$': { type: String },
        url__DISPLAYIF: { type: Boolean, optional: true },
        numberOfVisits: { type: Number, optional: true },
        numberOfVisits__DISPLAYIF: { type: Boolean, optional: true },
        numberOfPageVisits: { type: String, optional: true },
        numberOfPageVisits__DISPLAYIF: { type: Boolean, optional: true },
        device: { type: String, optional: true },
        device__DISPLAYIF: { type: Boolean, optional: true },
        queryString: { type: Array, optional: true },
        'queryString.$': { type: QueryStringSchema, optional: true },
        queryString__DISPLAYIF: { type: Boolean, optional: true },
        timeOnPage: { type: Number, optional: true },
        timeOnPage__DISPLAYIF: { type: Boolean, optional: true },
        eventListeners: { type: Array, optional: true },
        'eventListeners.$': { type: EventListenersSchema, optional: true },
        eventListeners__DISPLAYIF: { type: Boolean, optional: true },
    });
    
    export const RulesSchema = new SimpleSchema({
        // payload: { type: String, trim: true },
        text: { type: String, optional: true },
        text__DISPLAYIF: { type: Boolean, optional: true },
        trigger: {
            type: TriggerSchema,
            optional: true,
        },
    });
    
    export const rootSchema = new SimpleSchema({
        rules: { type: Array, optional: true },
        'rules.$': { type: RulesSchema },
        hasToggles: { type: Boolean, optional: true },
    });

    const toggleFields = [
        'rules.$.text',
        'rules.$.trigger.url',
        'rules.$.trigger.timeOnPage',
        'rules.$.trigger.numberOfVisits',
        'rules.$.trigger.numberOfPageVisits',
        'rules.$.trigger.device',
        'rules.$.trigger.queryString',
        'rules.$.trigger.eventListeners',
    ];

    const createPathElem = (key) => {
        const regex = /^[0-9]*$/gm;
        return key.match(regex) ? '$' : key;
    };

    const isEnabled = (field) => {
        switch (true) {
        case field === undefined:
            return false;
        case Array.isArray(field) && field.length === 0:
            return false;
        default:
            return true;
        }
    };

    const togglesTraverse = (model, parentPath) => {
        const modelWithToggles = model;
        const path = parentPath || '';
        Object.keys(modelWithToggles).forEach((key) => {
            const currentPath = path.length === 0 ? key : `${path}.${createPathElem(key)}`;
            if (toggleFields.includes(currentPath) && isEnabled(modelWithToggles[key])) {
                modelWithToggles[`${key}__DISPLAYIF`] = true;
                return;
            }
            if (typeof modelWithToggles[key] !== 'object') return;
            modelWithToggles[key] = togglesTraverse(modelWithToggles[key], currentPath);
        });
        return modelWithToggles;
    };

    const initializeToggles = () => {
        if (rules.hasToggles === true) return rules;
        const activeModel = togglesTraverse(rules);
        activeModel.hasToggles = true;
        return activeModel;
    };
    
    const activeModel = initializeToggles();


    const handleSubmit = (model) => {
        onChange(model);
    };

    return (
        <div className='story-trigger-form-container' data-cy='story-rules-editor'>
            <RulesForm autosave model={activeModel} schema={new SimpleSchema2Bridge(rootSchema)} onSubmit={handleSubmit}>
                <AutoField name='rules' label='Trigger rules'>
                    <AutoField name='$'>
                        <div className='list-container'>
                            <div className='delete-list-container'>
                                <ListDelField name='' />
                            </div>
                            <div className='list-element-container'>
                                <OptionalField name='text' label='Display a user message' data-cy='toggle-payload-text'>
                                    <AutoField name='' label='User message to display' data-cy='payload-text-input' />
                                </OptionalField>
                                <AutoField name='trigger' label='Conditions'>
                                    <OptionalField name='url' label='Add URL condition'>
                                        <AutoField name='' label='Trigger when the user visits these URLs' />
                                    </OptionalField>
                                    <OptionalField name='numberOfVisits' label='Trigger based on the number of times the user has visited the website' data-cy='toggle-website-visits'>
                                        <AutoField name='' label='Number of visits' data-cy='website-visits-input' />
                                    </OptionalField>
                                    <OptionalField name='numberOfPageVisits' label='Trigger based on the number of times the user has visited this specific page' data-cy='toggle-page-visits'>
                                        <AutoField name='' label='Number of page visits' data-cy='page-visits-input' />
                                    </OptionalField>
                                    <OptionalField name='device' label='Restrict to specific screen sizes'>
                                        <SelectField
                                            name=''
                                            placeholder='Select screen type'
                                            label='Trigger if the user is using a certain type of device'
                                            options={[
                                                { value: 'all', text: 'All' },
                                                { value: 'mobile', text: 'Mobile' },
                                                { value: 'desktop', text: 'Desktop' },
                                            ]}
                                        />
                                    </OptionalField>
                                    <OptionalField name='queryString' label='Trigger if specific query string parameters are present in the URL' data-cy='toggle-query-string'>
                                        <AutoField name='' data-cy='query-string-field' />
                                    </OptionalField>
                                    <OptionalField name='timeOnPage' label='Trigger once the user has been on this page for a certain amount of time' data-cy='toggle-time-on-page'>
                                        <AutoField name='' label='Number of seconds after which this conversation should be triggered' />
                                    </OptionalField>
                                    <OptionalField name='eventListeners' label='Enable event listener trigger' data-cy='toggle-event-listeners'>
                                        <AutoField name=''>
                                            <AutoField name='$'>
                                                <div className='list-container'>
                                                    <div className='delete-list-container'>
                                                        <ListDelField name='' />
                                                    </div>
                                                    <div className='list-element-container'>
                                                        <AutoField name='selector' label='CSS selector' />
                                                        <SelectField
                                                            name='event'
                                                            placeholder='Select an event type'
                                                            options={[
                                                                { value: 'click', text: 'Click' },
                                                                { value: 'dblclick', text: 'Double click' },
                                                                { value: 'mouseenter', text: 'Mouse enter' },
                                                                { value: 'mouseleave', text: 'Mouse leave' },
                                                                { value: 'mouseover', text: 'Mouse over' },
                                                                { value: 'mousemove', text: 'Mouse move' },
                                                                { value: 'change', text: 'Change' },
                                                                { value: 'blur', text: 'Blur' },
                                                                { value: 'focus', text: 'Focus' },
                                                                { value: 'focusin', text: 'Focus in' },
                                                                { value: 'focusout', text: 'Focus out' },
                                                            ]}
                                                        />
                                                        <AutoField name='once' label='Tirgger only the first time this event occurs' />
                                                    </div>
                                                </div>
                                            </AutoField>
                                        </AutoField>
                                    </OptionalField>
                                </AutoField>
                            </div>
                        </div>
                    </AutoField>
                </AutoField>
                <br />
                <ErrorsField />
                <br />
                <SubmitField value='Save and exit' onClick={saveAndExit} />
            </RulesForm>
        </div>
    );
}

StoryRulesForm.propTypes = {
    rules: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    saveAndExit: PropTypes.func.isRequired,
};

StoryRulesForm.defaultProps = {
    rules: { rules: [] },
};

export default StoryRulesForm;
