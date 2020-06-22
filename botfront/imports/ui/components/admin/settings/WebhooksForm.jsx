import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { GraphQLBridge } from 'uniforms-bridge-graphql';
import { buildASTSchema, parse } from 'graphql';
import {
    AutoForm, AutoField,
} from 'uniforms-semantic';
import { Divider } from 'semantic-ui-react';
import SelectField from '../../form_fields/SelectField';
import SaveButton from '../../utils/SaveButton';
import { wrapMeteorCallback } from '../../utils/Errors';

function WebHooksForm(props) {
    const {
        onSave, webhooks, editable, disableMethodField, path,
    } = props;
    const [saved, setSaved] = useState(null);
    const [saving, setSaving] = useState(null);
    const schema = buildASTSchema(
        parse(`
        type Webhook {
            name: String!
            url: String!
            ${!disableMethodField ? 'method: String!' : ''}
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

    useEffect(() => {
        const successTimeout = setTimeout(() => {
            setSaved(null);
        }, 2 * 1000);
        
        return () => { clearTimeout(successTimeout); };
    }, [saved]);

    const handleSave = (key, data) => {
        setSaving(key);
        onSave({ [`${path}${key}`]: data }, wrapMeteorCallback((err) => {
            setSaving(null);
            if (err) {
                setSaved(null);
                return;
            }
            setSaved(key);
        }));
    };
    return Object.keys(webhooks).map((k, i) => (
        <>
            {i > 0 && <Divider className='webhook-divider' />}
            <AutoForm
                model={webhooks[k]}
                schema={new GraphQLBridge(schema, validator, schemaData)}
                onSubmit={data => handleSave(k, data)}
                disabled={!editable}
                key={`webhook-${i}`}
            >
                <h3>{webhooks[k].name}</h3>
                <AutoField name='url' data-cy={webhooks[k].dataCy || 'webhook-url-field'} />
                {!disableMethodField && <SelectField name='method' />}
                <div className='side-by-side left'>
                    {editable && (
                        <SaveButton saved={k === saved} saving={k === saving} />
                    )}
                </div>
            </AutoForm>
        </>
    ));
}

WebHooksForm.propTypes = {
    webhooks: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    editable: PropTypes.bool.isRequired,
    disableMethodField: PropTypes.bool,
    path: PropTypes.string,
};

WebHooksForm.defaultProps = {
    path: '',
    disableMethodField: false,
};

export default WebHooksForm;
