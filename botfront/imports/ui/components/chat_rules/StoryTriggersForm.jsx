import React from 'react';
import PropTypes from 'prop-types';
import { GraphQLBridge } from 'uniforms-bridge-graphql';
import { buildASTSchema, parse } from 'graphql';
import {
    AutoForm, AutoField, ErrorsField, SubmitField, ListDelField,
} from 'uniforms-semantic';

import SelectField from '../form_fields/SelectField';
import OptionalField from './OptionalField';

// force open affect force close and vice versa

function StoryTriggersForm({
    storyTriggers, onChange,
}) {
    const schema = buildASTSchema(parse(`
        type StoryTriggerRules{
            rules: [StoryTriggerRule]
        }
        type StoryTriggerRule {
            payload: String!
            text: PayloadText
            trigger: Trigger!
        }
        type PayloadText {
            value: String
            enabled: Boolean
        }

        type Trigger {
            url: Url
            timeOnPage: TimeOnPage!
            numberOfVisits: NumberOfVisits!
            numberOfPageVisits: NumberOfPageVisits
            device: Device
            queryString: QueryStringList!
            eventListeners: eventListenersList!
        }
        type Url {
            value: [String]
            enabled: Boolean
        }
        type TimeOnPage {
            value: Float
            enabled: Boolean
        }
        type NumberOfVisits {
            value: Int
            enabled: Boolean
        }
        type NumberOfPageVisits {
            value: Int
            enabled: Boolean
        }
        type Device {
            value: String
            enabled: Boolean
        }

        type QueryStringList {
            enabled: Boolean
            value: [QueryString]
        }
        type QueryString {
            param: String!
            value: String!
        }
        type eventListenersList {
            enabled: Boolean
            value: [eventListeners]
        }
        type eventListeners {
            selector: String!
            event: String!
        }

        # This is required by buildASTSchema
        type Query { anything: ID }
    `)).getType('StoryTriggerRules');

    const schemaData = {
        'rules.$.payload': {
            label: 'Payload',
            defaultValue: '',
        },
        'rules.$.text.enabled': {
            label: 'Enable payload text',
            defaultValue: false,
        },
        'rules.$.text.value': {
            label: 'payload text',
            defaultValue: '',
        },
        'rules.$.trigger.url.enabled': {
            label: 'enable specific URLs',
        },
        'rules.$.trigger.url.value': {
            label: 'Trigger URLs',
        },
        'rules.$.trigger.timeOnPage.enabled': {
            label: 'Enable time on page',
        },
        'rules.$.trigger.timeOnPage.value': {
            label: 'Trigger after a period of time on a page',
        },
        'rules.$.trigger.numberOfVisits.enabled': {
            label: 'Enable number of visits',
        },
        'rules.$.trigger.numberOfVisits.value': {
            label: 'Tigger once the user has visited your website a certain number of times',
        },
        'rules.$.trigger.numberOfPageVisits.enabled': {
            label: 'Enable number of page visits',
        },
        'rules.$.trigger.numberOfPageVisits.value': {
            label: 'Tigger once the user has visited this page\'s url a certain number of times',
        },
        'rules.$.trigger.device.enabled': {
            label: 'Enable device trigger',
        },
        'rules.$.trigger.device.value': {
            label: 'Tigger based on the user\'s device',
            defaultValue: 'all',
            // allowedValues: ['', 'mobile', 'desktop'],
            options: [
                { value: 'all', text: 'All' },
                { value: 'mobile', text: 'Mobile' },
                { value: 'desktop', text: 'Desktop' },
            ],
        },
        'rules.$.trigger.queryString.enabled': {
            label: 'Enable queryString',
        },
        'rules.$.trigger.queryString.value': {
            label: 'Query string trigger',
        },
        'rules.$.trigger.eventListeners.enabled': {
            label: 'Enable event listener',
        },
        'rules.$.trigger.eventListeners.value': {
            label: 'Event listener trigger',
        },
    };

    // const removeToggles = (model) => {
    //     const nextModel = { ...model };
    //     Object.keys(model).forEach((key) => {
    //         if (typeof model[key] === 'object') {
    //             if ('value' in model[key] && 'enabled' in model[key] && Object.keys(model).length === 2) {
    //                 nextModel[key] = model[key].value;
    //                 return;
    //             }
    //             nextModel[key] = removeToggles(nextModel[key]);
    //         }
    //     });
    //     return nextModel;
    // };

    const handleSubmit = (model) => {
        // const cleanModel = removeToggles(model);
        onChange(model);
    };

    return (
        <div className='story-trigger-form-container'>
            {/* We don't need validation as fields are optionals and there is no user input */}
            <AutoForm autosave model={storyTriggers} schema={new GraphQLBridge(schema, () => { }, schemaData)} onSubmit={handleSubmit}>
                <AutoField name='rules'>
                    <AutoField name='$'>
                        <ListDelField />
                        <AutoField name='payload' />
                        <OptionalField name='text'>
                            <AutoField />
                        </OptionalField>
                        <AutoField name='trigger'>
                            <OptionalField name='url'>
                                <AutoField />
                            </OptionalField>
                            <OptionalField name='timeOnPage'>
                                <AutoField />
                            </OptionalField>
                            <OptionalField name='numberOfVisits'>
                                <AutoField />
                            </OptionalField>
                            <OptionalField name='numberOfPageVisits'>
                                <AutoField />
                            </OptionalField>
                            <OptionalField name='device'>
                                <SelectField
                                    placeHolder='all'
                                    options={schemaData['rules.$.trigger.device.value'].options}
                                />
                            </OptionalField>
                            <OptionalField name='queryString'>
                                <AutoField />
                            </OptionalField>
                            <OptionalField name='eventListeners'>
                                <AutoField />
                            </OptionalField>
                        </AutoField>
                    </AutoField>
                </AutoField>
                <br />
                <ErrorsField />
                <br />
                <SubmitField value='save' />
            </AutoForm>
        </div>
    );
}

StoryTriggersForm.propTypes = {
    storyTriggers: PropTypes.object,
    onChange: PropTypes.func.isRequired,
};

StoryTriggersForm.defaultProps = {
    storyTriggers: {},
};

export default StoryTriggersForm;
