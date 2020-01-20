import React from 'react';
import PropTypes from 'prop-types';
// import { GraphQLBridge } from 'uniforms-bridge-graphql';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import SimpleSchema from 'simpl-schema';
import {
    AutoForm, AutoField, ErrorsField, SubmitField, ListDelField,
} from 'uniforms-semantic';
import { cloneDeep } from 'lodash';

import SelectField from '../../form_fields/SelectField';
import OptionalField from '../../form_fields/OptionalField';

// force open affect force close and vice versa

function StoryRulesForm({
    triggerRules, onChange, saveAndExit, payloadName,
}) {
    const EventListenersSchema = new SimpleSchema({
        selector: { type: String, trim: true },
        event: { type: String, trim: true },
    });
    
    const QueryStringSchema = new SimpleSchema({
        param: { type: String, trim: true },
        value: { type: String, trim: true },
    });
    
    const TriggerSchema = new SimpleSchema({
        url: { type: Array, optional: true },
        'url.$': { type: String },
        url__DISPLAYIF: { type: Boolean, optional: true },
        numberOfVisits: { type: String, optional: true },
        numberOfVisits__DISPLAYIF: { type: Boolean, optional: true },
        numberOfPageVisits: { type: String, optional: true },
        numberOfPageVisits__DISPLAYIF: { type: Boolean, optional: true },
        device: { type: String, optional: true },
        device__DISPLAYIF: { type: Boolean, optional: true },
        queryString: { type: QueryStringSchema, optional: true },
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
        triggerRules: { type: Array, optional: true },
        'triggerRules.$': { type: RulesSchema },
        hasToggles: { type: Boolean, optional: true },
    });

    const toggleFields = [
        'triggerRules.$.text',
        'triggerRules.$.trigger.url',
        'triggerRules.$.trigger.timeOnPage',
        'triggerRules.$.trigger.numberOfVisits',
        'triggerRules.$.trigger.numberOfPageVisits',
        'triggerRules.$.trigger.device',
        'triggerRules.$.trigger.queryString',
        'triggerRules.$.trigger.eventListeners',
    ];

    const createPathElem = (key) => {
        const regex = /^[0-9]*$/gm;
        return key.match(regex) ? '$' : key;
    };

    const togglesTraverse = (model, parentPath) => {
        const modelWithToggles = model;
        const path = parentPath || '';
        Object.keys(modelWithToggles).forEach((key) => {
            const currentPath = path.length === 0 ? key : `${path}.${createPathElem(key)}`;
            if (toggleFields.includes(currentPath) && modelWithToggles[key] !== undefined) {
                modelWithToggles[`${key}__DISPLAYIF`] = true;
                return;
            }
            if (typeof modelWithToggles[key] !== 'object') return;
            modelWithToggles[key] = togglesTraverse(modelWithToggles[key], currentPath);
        });
        return modelWithToggles;
    };

    const initializeToggles = () => {
        if (triggerRules.hasToggles === true) return triggerRules;
        const activeModel = togglesTraverse(triggerRules);
        activeModel.hasToggles = true;
        return activeModel;
    };
    
    const activeModel = initializeToggles();

    const postProcess = (formModel) => {
        const model = cloneDeep(formModel);
        model.triggerRules = model.triggerRules.map((ruleSet, index) => {
            const newRuleSet = ruleSet;
            if (ruleSet.trigger
                && ruleSet.trigger.timeOnPage__DISPLAYIF === true
                && ruleSet.trigger.eventListeners__DISPLAYIF === true
            ) {
                if (!activeModel.triggerRules[index].trigger.eventListeners__DISPLAYIF) {
                    newRuleSet.trigger.timeOnPage__DISPLAYIF = false;
                } else {
                    newRuleSet.trigger.eventListeners__DISPLAYIF = false;
                }
            }
            if (!newRuleSet.payload) {
                newRuleSet.payload = payloadName;
            }
            return newRuleSet;
        });
        return model;
    };

    const handleSubmit = (model) => {
        onChange(postProcess(model));
    };

    return (
        <div className='story-trigger-form-container' data-cy='story-rules-editor'>
            <AutoForm autosave model={activeModel} schema={new SimpleSchema2Bridge(rootSchema)} onSubmit={handleSubmit}>
                <AutoField name='triggerRules' label='Trigger rules'>
                    <AutoField name='$'>
                        <div>
                            <div>
                                <ListDelField name='' />
                            </div>
                            <div>
                                <OptionalField name='text' label='Enable payload text' data-cy='toggle-payload-text'>
                                    <AutoField name='' label='Payload text' data-cy='payload-text-input' />
                                </OptionalField>
                                <AutoField name='trigger' label='Conditions'>
                                    <OptionalField name='url' label='Enable URL trigger'>
                                        <AutoField name='' label='trigger URLs' />
                                    </OptionalField>
                                    <OptionalField name='numberOfVisits' label='Enable number of website visits trigger' data-cy='toggle-website-visits'>
                                        <AutoField name='' label='Trigger once a user has visited this website a set number of times' data-cy='website-visits-input' />
                                    </OptionalField>
                                    <OptionalField name='numberOfPageVisits' label='Enable number of specific page visits trigger' data-cy='toggle-page-visits'>
                                        <AutoField name='' label='Tigger once a user has visited a specific page a set number of times' data-cy='page-visits-input' />
                                    </OptionalField>
                                    <OptionalField name='device' label='Enable device type trigger'>
                                        <SelectField
                                            name=''
                                            placeholder='Select a type of device to activate the payload'
                                            label='Trigger if the user is using a certain type of device'
                                            options={[
                                                { value: 'all', text: 'All' },
                                                { value: 'mobile', text: 'Mobile' },
                                                { value: 'desktop', text: 'Desktop' },
                                            ]}
                                        />
                                    </OptionalField>
                                    <OptionalField name='queryString' label='Enable query string trigger' data-cy='toggle-query-string'>
                                        <AutoField name='' data-cy='query-string-field' />
                                    </OptionalField>
                                    <OptionalField name='timeOnPage' label='Enable time on page trigger' data-cy='toggle-time-on-page'>
                                        <AutoField name='' label='Trigger after a period of time on a page' />
                                    </OptionalField>
                                    <OptionalField name='eventListeners' label='Enable event listener trigger' data-cy='toggle-event-listeners'>
                                        <AutoField name=''>
                                            <AutoField name='$'>
                                                <ListDelField name='' />
                                                <AutoField name='selector' />
                                                <SelectField
                                                    name='event'
                                                    placeholder='Select an event type'
                                                    options={[
                                                        { value: 'click', text: 'Click' },
                                                        { value: 'mouseover', text: 'Mouseover' },
                                                        { value: 'focus', text: 'Focus' },
                                                        { value: 'blur', text: 'Blur' },
                                                        { value: 'change', text: 'Change' },
                                                    ]}
                                                />
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
            </AutoForm>
        </div>
    );
}

StoryRulesForm.propTypes = {
    triggerRules: PropTypes.object,
    payloadName: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    saveAndExit: PropTypes.func.isRequired,
};

StoryRulesForm.defaultProps = {
    triggerRules: { triggerRules: [] },
};

export default StoryRulesForm;
