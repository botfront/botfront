import React from 'react';
import PropTypes from 'prop-types';
import { GraphQLBridge } from 'uniforms-bridge-graphql';
import { buildASTSchema, parse } from 'graphql';
import {
    AutoForm, AutoField, ErrorsField,
} from 'uniforms-semantic';
import ToggleField from '../common/ToggleField';


// force open affect force close and vice versa
class AutoFormMetadata extends AutoForm {
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

function ResponseMetadataForm({
    responseMetadata, onChange,
}) {
    const schema = buildASTSchema(parse(`
        type ResponseMetadata {
            linkTarget: String!
            userInput:  String!
            forceOpen: Boolean!
            forceClose: Boolean!
        }

        # This is required by buildASTSchema
        type Query { anything: ID }
    `)).getType('ResponseMetadata');

    const defaultModel = {
        linkTarget: '_blank',
        userInput: 'show',
        forceOpen: false,
        forceClose: false,
        domHighlight: {},
        customCss: {},
        pageChangeCallbacks: null,
    };

    const schemaData = {
        linkTarget: {
            label: 'Where should the links open?',
            defaultValue: '_blank',
            allowedValues: ['_blank', '_self'],
            options: [
                { label: 'In the current tab', value: '_self' },
                { label: 'In a new tab', value: '_blank' },
            ],
        },
        userInput: {
            label: 'How should the user input field be rendered?',
            defaultValue: 'show',
            allowedValues: ['show', 'hide', 'disable'],
            options: [
                { label: 'Show', value: 'show' },
                { label: 'Hide', value: 'hide' },
                { label: 'Disable', value: 'disable' },
            ],
        },
        forceOpen: {
            label: 'Force the chat widget to open? (Otherwise it will appear as a tooltip if the widget is closed)',
            defaultValue: false,
        },
        forceClose: {
            label: 'Force the chat widget to close? (message will appear as a tooltip)',
            defaultValue: false,
        },
    };

    const displayModel = responseMetadata || defaultModel;
    return (
        <div className='response-metadata-form'>
            {/* We don't need validation as fields are optionals and there is no user input */}
            <AutoFormMetadata autosave model={displayModel} schema={new GraphQLBridge(schema, () => { }, schemaData)} onSubmit={model => onChange(model)}>
                <AutoField name='linkTarget' data-cy='links-target' />
                <AutoField name='userInput' />
                <ToggleField
                    name='forceOpen'
                    className='toggle'
                    data-cy='toggle-force-open'
                />
                <ToggleField
                    name='forceClose'
                    className='toggle'
                />
                <br />
                <ErrorsField />
                <br />
            </AutoFormMetadata>
        </div>
    );
}

ResponseMetadataForm.propTypes = {
    responseMetadata: PropTypes.object,
    onChange: PropTypes.func.isRequired,
};

ResponseMetadataForm.defaultProps = {
    responseMetadata: {
        linkTarget: '_blank',
        userInput: 'show',
        domHighlight: {},
        customCss: {},
        pageChangeCallbacks: null,
    },
};

export default ResponseMetadataForm;
