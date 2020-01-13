import React from 'react';
import PropTypes from 'prop-types';
import { GraphQLBridge } from 'uniforms-bridge-graphql';
import { buildASTSchema, parse } from 'graphql';
import {
    AutoForm, AutoField, ErrorsField,
} from 'uniforms-semantic';
import { Segment } from 'semantic-ui-react';
import ToggleField from '../common/ToggleField';


// force open affect force close and vice versa
class AutoFormWidgetRules extends AutoForm {
    onChange(key, value) {
        if (key === 'forceOpen') {
            super.onChange('forceOpen', value);
            if (value) super.onChange('forceClose', false);
            return;
        }
        if (key === 'forceClose') {
            super.onChange('forceClose', value);
            if (value) super.onChange('forceOpen', false);
            return;
        }
        super.onChange(key, value);
    }
}

function WidgetRulesForm({
    WidgetRules, onChange,
}) {
    const schema = buildASTSchema(parse(`
        type WidgetRules {
            test: Boolean!
            payload: String!
            text: String!
            trigger: Url
            timeOnPage: Float
            numberOfVists: Int
            numberOfPageVists: Int
            device: String
            queryString: [QueryString]
            eventListeners: [EventListener]
        }

        type QueryString {
            param: String!
            value: String!
        }

        type EventListener {
            selector: String!
            event: String!
        }

        union Url = UrlString | UrlList

        type UrlString {
            url : String!
        }

        type UrlList {
            url:  [String!]
        }

        # This is required by buildASTSchema
        type Query { anything: ID }
    `)).getType('WidgetRules');

    const defaultModel = {
        test: false,
    };

    const schemaData = {
        test: {
            label: 'this is a test',
            defaultValue: false,
        },
        payload: {
            label: 'Payload',
            defaultValue: '',
        },
        text: {
            label: 'text',
            defaultValue: '',
        },
        trigger: {
            label: 'trigger url',
            defaultValue: '',
        },
        timeOnPage: {
            label: 'Time on page',
        },
        numberOfPageVists: {
            label: 'Number of visits',
        },
        device: {
            label: 'device',
        },
        queryString: {
            label: 'query string',
        },
        eventListeners: {
            label: 'event Listners',
        },
    };

    const displayModel = WidgetRules || defaultModel;
    return (
        <Segment>
            <div className='response-metadata-form'>
                {/* We don't need validation as fields are optionals and there is no user input */}
                <AutoFormWidgetRules autosave model={displayModel} schema={new GraphQLBridge(schema, () => { }, schemaData)} onSubmit={model => onChange(model)}>
                    <ToggleField
                        name='test'
                        className='toggle'
                    />
                    <AutoField name='payload' />
                    <AutoField name='text' />
                    <AutoField name='trigger' />
                    <AutoField name='timeOnPage' />
                    <AutoField name='numberOfPageVisits' />
                    <AutoField name='device' />
                    <AutoField name='queryString' />
                    <AutoField name='eventListeners' />
                    <br />
                    <ErrorsField />
                    <br />
                </AutoFormWidgetRules>
            </div>
        </Segment>
    );
}

WidgetRulesForm.propTypes = {
    WidgetRules: PropTypes.object,
    onChange: PropTypes.func,
};

WidgetRulesForm.defaultProps = {
    WidgetRules: {
        test: false,
    },
    onChange: () => {},
};

export default WidgetRulesForm;
