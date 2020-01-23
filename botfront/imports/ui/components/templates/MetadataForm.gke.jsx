import React from 'react';
import PropTypes from 'prop-types';
import { GraphQLBridge } from 'uniforms-bridge-graphql';
import { buildASTSchema, parse, extendSchema } from 'graphql';
import {
    Message, Tab,
} from 'semantic-ui-react';
import {
    SelectField, AutoField, ErrorsField, LongTextField, ListField, ListItemField, NestField,
} from 'uniforms-semantic';
import { cloneDeep } from 'lodash';
import InfoField from '../utils/InfoField';
import ToggleField from '../common/ToggleField';
import DisplayIf from '../DisplayIf';


import {
    basicSchemaString, defaultModel, schemaData, AutoFormMetadata, panes,
} from './MetadataForm';

function ResponseMetadataForm({
    responseMetadata, onChange,
}) {
    const pageEventOptions = [
        {
            label: 'click',
            value: 'click',
        },
        {
            label: 'dblclick',
            value: 'dblclick',
        },
        {
            label: 'mouseenter',
            value: 'mouseenter',
        },
        {
            label: 'mouseleave',
            value: 'mouseleave',
        },
        {
            label: 'mouseover',
            value: 'mouseover',
        },
        {
            label: 'change',
            value: 'change',
        },
        {
            label: 'blur',
            value: 'blur',
        },
        {
            label: 'focus',
            value: 'focus',
        },
        {
            label: 'focusin',
            value: 'focusin',
        },
        {
            label: 'focusout',
            value: 'focusout',
        },
    ];
    const schema = extendSchema(buildASTSchema(parse(`
    
    type PageChange {
        url: String!
        callbackIntent: String!
    }

    type PageChangeCallbacks {
        enabled: Boolean!
        pageChanges: [PageChange!]
        errorIntent: String
    }

    type PageEventCallbacks {
        enabled: Boolean!
        pageEvents: [PageEvent!]
    }

    type PageEvent{
        event: String!
        payload: String!
        selector: String!
    }

    type DomHighlight {
        enabled: Boolean!
        selector: String
        css: String
    }

    type CustomCss {
        enabled: Boolean!
        text: String
        messageContainer: String
    }
    
    ${basicSchemaString}

    # This is required by buildASTSchema
    type Query { anything: ID }
    `)), parse(`
    extend type ResponseMetadata {
        domHighlight: DomHighlight
        pageChangeCallbacks : PageChangeCallbacks
        pageEventCallbacks : PageEventCallbacks
        customCss: CustomCss
    }`)).getType('ResponseMetadata');

    const defaultModelAdvanced = {
        ...defaultModel,
        domHighlight: {},
        customCss: {},
        pageChangeCallbacks: null,
        pageEventCallbacks: null,
    };

    const panesAdvanced = [
        ...panes,
        {
            menuItem: 'Callbacks',
            render: () => (
                <>
                    <ToggleField name='pageChangeCallbacks.enabled' className='toggle' label='Enable page change callbacks' />
                    <DisplayIf condition={context => context.model.pageChangeCallbacks && context.model.pageChangeCallbacks.enabled}>
                        <>
                            <Message
                                info
                                content={(
                                    <>
                                        In each <strong>Page change</strong> you can defined a <strong>URL</strong> to be matched against the next URL visited by the user.<br />
                                        The <strong>Callback intent</strong> will be sent by the chat widget if this page is visited.<br />
                                        If none of the pages are visited, the <strong>Error intent</strong> will be triggered.
                                    </>
                                )}
                            />
                            <AutoField name='pageChangeCallbacks.pageChanges' />
                            <AutoField name='pageChangeCallbacks.errorIntent' />
                        </>
                    </DisplayIf>
                    <ToggleField name='pageEventCallbacks.enabled' className='toggle' label='Enable page event callbacks' />
                    <DisplayIf condition={context => context.model.pageEventCallbacks && context.model.pageEventCallbacks.enabled}>
                        <>
                            <Message
                                info
                                content={(
                                    <>
                                        In each <strong>Page Event</strong> you can defined a <strong>event</strong> to be matched against the next URL visited by the user.<br />
                                        The <strong>Callback intent</strong> will be sent by the chat widget if this page is visited.<br />
                                    </>
                                )}
                            />
                            <ListField name='pageEventCallbacks.pageEvents'>
                                <ListItemField name='$'>
                                    <NestField name=''>
                                        <SelectField name='event' options={pageEventOptions} />
                                        <AutoField name='selector' />
                                        <AutoField name='payload' />
                                    </NestField>
                                </ListItemField>
                            </ListField>
                        </>
                    </DisplayIf>
                </>
            ),
        },
        {
            menuItem: 'Highlight a DOM element',
            render: () => (
                <>
                    <ToggleField name='domHighlight.enabled' className='toggle' label='Enable' />
                    <DisplayIf condition={context => context.model.domHighlight && context.model.domHighlight.enabled}>
                        <>
                            <InfoField name='domHighlight.selector' label='CSS selector' info='The CSS selector of the DOM element to highlight' />
                            <InfoField name='domHighlight.css' label='CSS' info='The CSS to apply to the selector' />
                        </>
                    </DisplayIf>
                </>
            ),
        },
        {
            menuItem: 'Custom CSS',
            render: () => (
                <>
                    <ToggleField name='customCss.enabled' className='toggle' label='Enable' />
                    <DisplayIf condition={context => context.model.customCss && context.model.customCss.enabled}>
                        <>
                            <LongTextField name='customCss.text' label='Message text CSS' data-cy='custom-message-css' />
                            <LongTextField name='customCss.messageContainer' label='Message container CSS' data-cy='custom-container-css' />
                        </>
                    </DisplayIf>
                </>
            ),
        },
    ];

    const postProcess = (model) => {
        const newModel = cloneDeep(model);
        // Remove objects if they were disabled
        if (newModel.domHighlight && !newModel.domHighlight.enabled) delete newModel.domHighlight;
        if (newModel.customCss && !newModel.customCss.enabled) delete newModel.customCss;
        if (newModel.pageChangeCallbacks && !newModel.pageChangeCallbacks.enabled) delete newModel.pageChangeCallbacks;
        if (newModel.pageEventCallbacks && !newModel.pageEventCallbacks.enabled) delete newModel.pageEventCallbacks;

        // Remove enabled fields
        if (newModel.domHighlight && newModel.domHighlight.enabled) delete newModel.domHighlight.enabled;
        if (newModel.customCss && newModel.customCss.enabled) delete newModel.customCss.enabled;
        if (newModel.pageChangeCallbacks && newModel.pageChangeCallbacks.enabled) delete newModel.pageChangeCallbacks.enabled;
        if (newModel.pageEventCallbacks && newModel.pageEventCallbacks.enabled) delete newModel.pageEventCallbacks.enabled;

        return newModel;
    };

    const getPageChangeErrors = ({ pageChangeCallbacks }) => {
        const errors = [];
        if (pageChangeCallbacks && pageChangeCallbacks.enabled) {
            if (!pageChangeCallbacks || !pageChangeCallbacks.pageChanges || pageChangeCallbacks.pageChanges.length < 1) {
                errors.push({ name: 'pageChangeCallback.pageChanges', message: 'If you enable page changes you should at least have one' });
            }
        }

        if (pageChangeCallbacks && pageChangeCallbacks.pageChanges && pageChangeCallbacks.pageChanges.length) {
            const missing = [];
            pageChangeCallbacks.pageChanges.forEach((i) => {
                if (!i.url || !i.url.length < 0 || !i.callbackIntent || !i.callbackIntent.length < 0) { missing.push(i); }
            });
            if (missing.length) {
                errors.push({ name: 'pageChangeCallback.pageChanges', message: 'One of your Page Changes listener has a URL or an Intent Callback missing' });
            }

            if (!pageChangeCallbacks.errorIntent || pageChangeCallbacks.length < 1) {
                errors.push({ name: 'pageChangeCallback.pageChanges.errorIntent', message: 'You are listening to page changes but the Error Intent is missing.' });
            }
        }
        return errors;
    };

    const getPageEventErrors = ({ pageEventCallbacks }) => {
        const errors = [];
        if (pageEventCallbacks && pageEventCallbacks.enabled) {
            if (!pageEventCallbacks || !pageEventCallbacks.pageEvents || pageEventCallbacks.pageEvents.length < 1) {
                errors.push({ name: 'pageEventCallback.pageEvents', message: 'If you enable page Events you should at least have one' });
            }
        }

        if (pageEventCallbacks && pageEventCallbacks.pageEvents && pageEventCallbacks.pageEvents.length) {
            const missing = [];
            pageEventCallbacks.pageEvents.forEach((i) => {
                if (!i.event || !i.event.length < 0 || !i.payload || !i.payload.length < 0 || !i.selector || !i.selector.length < 0) { missing.push(i); }
            });
            if (missing.length) {
                errors.push({ name: 'pageEventCallback.pageEvents', message: 'One of your Page Events listener has a selector, an event or a payload missing' });
            }
        }
        return errors;
    };

    const validator = (model) => {
        const errors = [...getPageChangeErrors(model), ...getPageEventErrors(model)];

        if (model.customCss && model.customCss.enabled && !model.customCss.text && !model.customCssContainer) {
            errors.push({ name: 'customCss', message: 'You enabled Custom CSS but you set neither text nor message container properties' });
        }

        if (model.domHighlight
            && model.domHighlight.enabled
            && (
                (!model.domHighlight.selector || !model.domHighlight.selector.length)
                || (!model.domHighlight.css || !model.domHighlight.css.length)
            )
        ) {
            errors.push({ name: 'domHighlight', message: 'When enabling DOM highlighting both selector and css must be set.' });
        }

        if (errors.length) {
            // eslint-disable-next-line no-throw-literal
            throw { details: errors };
        }
    };

    const preprocessModel = (model) => {
        const newModel = cloneDeep(model);
        if (newModel.domHighlight && (newModel.domHighlight.selector)) newModel.domHighlight.enabled = true;
        if (newModel.pageChangeCallbacks && (newModel.pageChangeCallbacks.pageChanges.length > 0)) newModel.pageChangeCallbacks.enabled = true;
        if (newModel.pageEventCallbacks && (newModel.pageEventCallbacks.pageEvents.length > 0)) newModel.pageEventCallbacks.enabled = true;
        if (newModel.customCss && (newModel.customCss.text)) newModel.customCss.enabled = true;
        return newModel;
    };


    const displayModel = responseMetadata ? preprocessModel(responseMetadata) : preprocessModel(defaultModelAdvanced);

    return (
        <div className='response-metadata-form'>
            <AutoFormMetadata autosave model={displayModel} schema={new GraphQLBridge(schema, validator, schemaData)} onSubmit={model => onChange(postProcess(model))}>
                <Tab menu={{ secondary: true, pointing: true }} panes={panesAdvanced} />
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
