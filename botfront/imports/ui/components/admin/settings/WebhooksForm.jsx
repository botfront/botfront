import React from 'react';
import PropTypes from 'prop-types';
import { GraphQLBridge } from 'uniforms-bridge-graphql';
import { buildASTSchema, parse } from 'graphql';
import { Tab } from 'semantic-ui-react';
import {
    AutoForm, AutoField, SubmitField,
} from 'uniforms-semantic';
import SelectField from '../../form_fields/SelectField';
import { can } from '../../../../lib/scopes';

function WebHooksForm(props) {
    const { onSave, webhooks } = props;
    const schema = buildASTSchema(
        parse(`
        type Webhook {
            name: String!
            url: String!
            method: String!
        }

        # This is required by buildASTSchema
        type Query { anything: ID }
    `),
    ).getType('Webhook');

    const validator = () => { };

    const schemaData = {
        url: {
            label: 'URL',
        },
        method: {
            label: 'HTTP method',
            allowedValues: [
                'GET',
                'HEAD',
                'POST',
                'PUT',
                'DELETE',
                'CONNECT',
                'OPTIONS',
                'TRACE',
                'PATCH',
            ],
        },
    };

    const handleSave = (key, data) => onSave({ [`settings.private.webhooks.${key}`]: data });

    return Object.keys(webhooks).map(k => (
        <Tab.Pane>
            <AutoForm
                model={webhooks[k]}
                schema={new GraphQLBridge(schema, validator, schemaData)}
                onSubmit={data => handleSave(k, data)}
                disabled={!can('global-settings:w', { anyScope: true })}
            >
                <h3>{webhooks[k].name}</h3>
                <AutoField name='url' />
                <SelectField name='method' />
                <div className='side-by-side left'>
                    {can('global-settings:w', { anyScope: true }) && <SubmitField data-cy='save-global-settings' value='Save' className='primary' />}
                </div>
            </AutoForm>
        </Tab.Pane>
    ));
}

WebHooksForm.propTypes = {
    webhooks: PropTypes.array.isRequired,
    onSave: PropTypes.func.isRequired,
};

WebHooksForm.defaultProps = {};

export default WebHooksForm;
