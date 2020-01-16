import React from 'react';
import PropTypes from 'prop-types';
// import { GraphQLBridge } from 'uniforms-bridge-graphql';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import SimpleSchema from 'simpl-schema';
import {
    AutoForm, AutoField, ErrorsField, SubmitField, ListDelField,
} from 'uniforms-semantic';

import SelectField from '../form_fields/SelectField';
import OptionalField from './OptionalField';

// force open affect force close and vice versa

function StoryTriggersForm({
    storyTriggers, onChange, saveAndExit,
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
        timeOnPage: { type: Number, optional: true },
        timeOnPage__DISPLAYIF: { type: Boolean, optional: true },
        numberOfVisits: { type: String, optional: true },
        numberOfVisits__DISPLAYIF: { type: Boolean, optional: true },
        numberOfPageVisits: { type: String, optional: true },
        numberOfPageVisits__DISPLAYIF: { type: Boolean, optional: true },
        device: { type: String, optional: true },
        device__DISPLAYIF: { type: Boolean, optional: true },
        queryString: { type: QueryStringSchema, optional: true },
        queryString__DISPLAYIF: { type: Boolean, optional: true },
        eventListeners: { type: EventListenersSchema, optional: true },
        eventListeners__DISPLAYIF: { type: Boolean, optional: true },
    });
    
    export const RulesSchema = new SimpleSchema({
        payload: { type: String, trim: true },
        text: { type: String, optional: true },
        text__DISPLAYIF: { type: Boolean, optional: true },
        trigger: {
            type: TriggerSchema,
            optional: true,
        },
    });
    
    export const rootSchema = new SimpleSchema({
        triggers: { type: Array, optional: true },
        'triggers.$': { type: RulesSchema },
        hasToggles: { type: Boolean, optional: true },
    });

    const toggleFields = [
        'triggers.$.text',
        'triggers.$.trigger.url',
        'triggers.$.trigger.timeOnPage',
        'triggers.$.trigger.numberOfVisits',
        'triggers.$.trigger.numberOfPageVisits',
        'triggers.$.trigger.device',
        'triggers.$.trigger.queryString',
        'triggers.$.trigger.eventListeners',
    ];

    const createPathElem = (key) => {
        const regex = /^[0-9]*$/gm;
        return key.match(regex) ? '$' : key;
    };

    const initiaizeToggles = (model, parentPath) => {
        const modelWithToggles = model;
        const path = parentPath || '';
        Object.keys(modelWithToggles).forEach((key) => {
            const currentPath = path.length === 0 ? key : `${path}.${createPathElem(key)}`;
            if (toggleFields.includes(currentPath) && modelWithToggles[key] !== undefined) {
                modelWithToggles[`${key}__DISPLAYIF`] = true;
                return;
            }
            if (typeof modelWithToggles[key] !== 'object') return;
            modelWithToggles[key] = initiaizeToggles(modelWithToggles[key], currentPath);
        });
        return modelWithToggles;
    };

    const handleSubmit = (model) => {
        onChange(model);
    };

    const setActiveModel = () => {
        if (storyTriggers.hasToggles === true) return storyTriggers;
        const activeModel = initiaizeToggles(storyTriggers);
        activeModel.hasToggles = true;
        return activeModel;
    };
    
    const activeModel = setActiveModel();

    return (
        <div className='story-trigger-form-container'>
            <AutoForm autosave model={activeModel} schema={new SimpleSchema2Bridge(rootSchema)} onSubmit={handleSubmit}>
                <AutoField name='triggers' label='Triggers'>
                    <AutoField name='$'>
                        <ListDelField name='' />
                        <AutoField name='payload' label='Payload name' />
                        <OptionalField name='text' label='Enable payload text'>
                            <AutoField label='Payload text' />
                        </OptionalField>
                        <AutoField name='trigger' label='Conditions'>
                            <OptionalField name='url' label='Enable URL trigger'>
                                <AutoField label='trigger URLs' />
                            </OptionalField>
                            <OptionalField name='timeOnPage' label='Enable time on page trigger'>
                                <AutoField label='Trigger after a period of time on a page' />
                            </OptionalField>
                            <OptionalField name='numberOfVisits' label='Enable number of website visits trigger'>
                                <AutoField lable='Trigger once a user has visited this website a set number of times' />
                            </OptionalField>
                            <OptionalField name='numberOfPageVisits' label='Enable number of specific page visits trigger'>
                                <AutoField label='Tigger once a user has visited a specific page a set number of times' />
                            </OptionalField>
                            <OptionalField name='device' label='Enable device type trigger'>
                                <SelectField
                                    placeholder='Select a type of device to activate the payload'
                                    label='Trigger if the user is using a certain type of device'
                                    options={[
                                        { value: 'all', text: 'All' },
                                        { value: 'mobile', text: 'Mobile' },
                                        { value: 'desktop', text: 'Desktop' },
                                    ]}
                                />
                            </OptionalField>
                            <OptionalField name='queryString' label='Enable query string trigger'>
                                <AutoField />
                            </OptionalField>
                            <OptionalField name='eventListeners' label='Enable event trigger'>
                                <AutoField>
                                    <AutoField name='selector' label='Selector' />
                                    <AutoField name='event' label='Event' />
                                </AutoField>
                            </OptionalField>
                        </AutoField>
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

StoryTriggersForm.propTypes = {
    storyTriggers: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    saveAndExit: PropTypes.func.isRequired,
};

StoryTriggersForm.defaultProps = {
    storyTriggers: { triggers: [] },
};

export default StoryTriggersForm;
