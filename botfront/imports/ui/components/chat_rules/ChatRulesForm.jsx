import React from 'react';
import PropTypes from 'prop-types';
import { GraphQLBridge } from 'uniforms-bridge-graphql';
import { buildASTSchema, parse } from 'graphql';
import {
    AutoForm, AutoField, ErrorsField,
} from 'uniforms-semantic';
import { Header } from 'semantic-ui-react';

import ToggleField from '../common/ToggleField';
import DisplayIf from '../DisplayIf';
import InfoField from '../utils/InfoField';
import SelectField from '../form_fields/SelectField';

// force open affect force close and vice versa

function ChatRulesForm({
    ChatRules, onChange,
}) {
    const schema = buildASTSchema(parse(`
        type ChatRules {
            payload: String!
            text: PayloadText!
            trigger: Trigger!
        }
        type PayloadText {
            value: String!
            enabled: Boolean!
        }

        type Trigger {
            url: Url
            timeOnPage: TimeOnPage!
            numberOfVisits: NumberOfVisits!
            numberOfPageVisits: NumberOfPageVisits
            numberOfPageVisitsEnabled: NumberOfPageVisits
            device: Device
            queryString: QueryStringList!
            eventListeners: eventListenersList!
        }
        type Url {
            value: String!
            enabled: Boolean
        }
        type TimeOnPage {
            value: Float!
            enabled: Boolean!
        }
        type NumberOfVisits {
            value: Int!
            enabled: Boolean
        }
        type NumberOfPageVisits {
            value: Int!
            enabled: Boolean
        }
        type Device {
            value: String!
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
    `)).getType('ChatRules');

    const defaultModel = {
        test: false,
    };

    const schemaData = {
        payload: {
            label: 'Payload',
            defaultValue: '',
        },
        'text.enabled': {
            label: 'Enable payload text',
            defaultValue: false,
        },
        'text.value': {
            label: 'payload text',
            defaultValue: '',
        },
        'trigger.timeOnPage.enabled': {
            label: 'Enable time on page',
        },
        'trigger.timeOnPage.value': {
            label: 'Trigger after a period of time on a page',
        },
        'trigger.numberOfVisits.enabled': {
            label: 'Enable number of visits',
        },
        'trigger.numberOfVisits.value': {
            label: 'Tigger once the user has visited your website a certain number of times',
        },
        'trigger.numberOfPageVisits.enabled': {
            label: 'Enable number of page visits',
        },
        'trigger.numberOfPageVisits.value': {
            label: 'Tigger once the user has visited this page\'s url a certain number of times',
        },
        'trigger.device.enabled': {
            label: 'Enable device selector',
        },
        'trigger.device.value': {
            label: 'Tigger based on the user\'s device',
            defaultValue: '',
            allowedValues: ['all', 'mobile', 'desktop'],
            options: [
                { label: 'All', value: '' },
                { label: 'mobile', value: 'mobile' },
                { label: 'desktop', value: 'desktop' },
            ],
        },
        'trigger.queryString.enabled': {
            label: 'Enable queryString',
        },
        'trigger.queryString.value': {
            label: 'Query string trigger',
        },
        'trigger.eventListeners.enabled': {
            label: 'Enable event listener',
        },
        'trigger.eventListeners.value': {
            label: 'Event listener trigger',
        },

        // junk code after
        /*
        trigger: {
            label: 'Trigger',
        },
        'trigger.url.value': {
            label: 'Url',
        },
        'trigger.timeOnPage': {
            label: 'Time on page',
        },
        'tigger.numberOfVisits': {
            label: 'Number of website visits',
        },
        'trigger.numberOfPageVisits': {
            label: 'Number of visits to this page',
        },
        'trigger.device': {
            label: 'Device',
            defaultValue: 'all',
            allowedValues: ['all', 'mobile', 'desktop'],
            options: [
                { label: 'All', value: '' },
                { label: 'mobile', value: 'mobile' },
                { label: 'desktop', value: 'desktop' },
            ],
        },
        'trigger.queryString': {
            label: 'Query string',
        },
        'trigger.eventListenerss': {
            label: 'Event listners',
        },
        */
    };

    const displayModel = ChatRules || defaultModel;
    return (

        <div className='response-metadata-form'>
            {/* We don't need validation as fields are optionals and there is no user input */}
            <AutoForm autosave model={displayModel} schema={new GraphQLBridge(schema, () => { }, schemaData)} onSubmit={model => onChange(model)}>
                <AutoField name='payload' />
                {/* <ToggleField name='textEnabled' /> */}
                {/* <DisplayIf condition={context => context.model.textEnabled}>
                    <AutoField name='text' />
                </DisplayIf> */}
                <ToggleField name='text.enabled' />
                <DisplayIf condition={context => context.model.text.enabled}>
                    <AutoField name='text.value' />
                </DisplayIf>
                <>
                    <Header size='small'>Triggers</Header>
                    <ToggleField name='trigger.timeOnPage.enabled' />
                    <DisplayIf condition={context => context.model.trigger.timeOnPage.enabled}>
                        <AutoField name='trigger.timeOnPage.value' />
                    </DisplayIf>
                    <ToggleField name='trigger.numberOfVisits.enabled' />
                    <DisplayIf condition={context => context.model.trigger.numberOfVisits.enabled}>
                        <AutoField name='trigger.numberOfVisits.value' />
                    </DisplayIf>
                    <ToggleField name='trigger.numberOfPageVisits.enabled' />
                    <DisplayIf condition={context => context.model.trigger.numberOfPageVisits.enabled}>
                        <AutoField name='trigger.numberOfPageVisits.value' />
                    </DisplayIf>
                    <ToggleField name='trigger.device.enabled' />
                    <DisplayIf condition={context => context.model.trigger.device.enabled}>
                        <SelectField name='trigger.device.value' />
                    </DisplayIf>
                    <ToggleField name='trigger.queryString.enabled' />
                    <DisplayIf condition={context => context.model.trigger.queryString.enabled}>
                        <SelectField name='trigger.queryString.value' />
                    </DisplayIf>
                    <ToggleField name='trigger.eventListeners.enabled' />
                    <DisplayIf condition={context => context.model.trigger.eventListeners.enabled}>
                        <SelectField name='trigger.eventListeners.value' />
                    </DisplayIf>
                    
                </>
                <br />
                <ErrorsField />
                <br />
            </AutoForm>
        </div>
    );
}

ChatRulesForm.propTypes = {
    ChatRules: PropTypes.object,
    onChange: PropTypes.func,
};

ChatRulesForm.defaultProps = {
    ChatRules: {
        text: '',
        trigger: {
            timeOnPage: 0,
            numberOfVisits: 0,
            numberOfPageVisits: 0,
            device: '',
            eventListeners: {
                value: [],
            },
            queryString: {
                value: [],
            },
        },
    },
    onChange: () => {},
};

export default ChatRulesForm;
