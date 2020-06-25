import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { GraphQLBridge } from 'uniforms-bridge-graphql';
import { ErrorsField } from 'uniforms-semantic';
import { buildASTSchema, parse } from 'graphql';
import {
    basicSchemaString, defaultModel, schemaData, AutoFormMetadata, panes,
} from './MetadataForm';

function ResponseMetadataForm({
    responseMetadata, onChange,
}) {
    const schema = buildASTSchema(parse(`${basicSchemaString}
    # This is required by buildASTSchema
    type Query { anything: ID }
    `)).getType('ResponseMetadata');

    const [displayModel, setDisplayModel] = useState(responseMetadata || defaultModel);

    const handleOnChange = (model) => {
        onChange(model);
        setDisplayModel(model);
    };
    return (
        <div className='response-metadata-form'>
            {/* We don't need validation as fields are optionals and there is no user input */}
            <AutoFormMetadata autosave model={displayModel} schema={new GraphQLBridge(schema, () => { }, schemaData)} onSubmit={handleOnChange}>
                {panes[0].render()}
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
