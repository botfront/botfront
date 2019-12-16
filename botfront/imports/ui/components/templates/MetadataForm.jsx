import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { GraphQLBridge } from 'uniforms-bridge-graphql';
import { buildASTSchema, parse } from 'graphql';
import {
    Message, Tab,
} from 'semantic-ui-react';
import {
    AutoForm, AutoField, ErrorsField, LongTextField, SubmitField,
} from 'uniforms-semantic';
import { cloneDeep } from 'lodash';
import InfoField from '../utils/InfoField';
import ToggleField from '../common/ToggleField';
import DisplayIf from '../DisplayIf';

function ResponseMetadataForm({
    responseMetadata, onChange,
}) {
    const schema = buildASTSchema(parse(`

        type PageChange {
            url: String!
            callbackIntent: String!
        }

        type PageChangeCallbacks {
            enabled: Boolean!
            pageChanges: [PageChange!]
            errorIntent: String
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

        type ResponseMetadata {
            linksTarget: String!
            userInput:  String!

            userInputHint:  String!
            messageTarget:  String!
            domHighlight: DomHighlight
            pageChangeCallbacks : PageChangeCallbacks
            customCss: CustomCss
        }

        # This is required by buildASTSchema
        type Query { anything: ID }
    `)).getType('ResponseMetadata');

    const defaultModel = {
        linksTarget: '_blank',
        userInput: 'show',
        messageTarget: 'conversation',
        domHighlight: {},
        customCss: {},
        pageChangeCallbacks: null,
    };

    const postProcess = (model) => {
        const newModel = cloneDeep(model);
        // Remove objects if they were disabled
        if (newModel.domHighlight && !newModel.domHighlight.enabled) delete newModel.domHighlight;
        if (newModel.customCss && !newModel.customCss.enabled) delete newModel.customCss;
        if (newModel.pageChangeCallbacks && !newModel.pageChangeCallbacks.enabled) delete newModel.pageChangeCallbacks;

        // Remove enabled fields
        if (newModel.domHighlight && newModel.domHighlight.enabled) delete newModel.domHighlight.enabled;
        if (newModel.customCss && newModel.customCss.enabled) delete newModel.customCss.enabled;
        if (newModel.pageChangeCallbacks && newModel.pageChangeCallbacks.enabled) delete newModel.pageChangeCallbacks.enabled;

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

    const validator = (model) => {
        const errors = [...getPageChangeErrors(model)];

        if (model.customCss && model.customCss.enabled && !model.customCss.text && !model.customCssContainer) {
            errors.push({ name: 'customCss', message: 'You enabled Custom CSS but you set neither text nor message container properties' });
        }

        if (model.domHighlight && model.domHighlight.enabled && ((!model.domHighlight.selector || !model.domHighlight.selector.length) || (!model.domHighlight.css || !model.domHighlight.css.length))) {
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
        if (newModel.customCss && (newModel.customCss.text)) newModel.customCss.enabled = true;
        return newModel;
    };

    const schemaData = {
        linksTarget: {
            label: 'Where should the links open?',
            defaultValue: '_blank',
            allowedValues: ['_blank', '_self'],
            options: [
                { label: 'In the current tab', value: '_blank' },
                { label: 'In a new tab', value: '_self' },
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
        messageTarget: {
            label: 'Where do you want to display the message?',
            options: [
                { label: 'Tooltip (only when conversation has not started yet)', value: 'tooltip_init' },
                { label: 'Tooltip (always)', value: 'tooltip_always' },
                { label: 'In the conversation', value: 'conversation' },
            ],
        },
    };

    const panes = [
        {
            menuItem: 'General',
            render: () => (
                <>
                    <AutoField name='linksTarget' />
                    <AutoField name='userInput' />
                    <AutoField name='messageTarget' />
                </>
            ),
        },
        {
            menuItem: 'Listen to a page change',
            render: () => (
                <>
                    <ToggleField name='pageChangeCallbacks.enabled' className='toggle' label='Enable' />
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
                            <LongTextField name='customCss.text' label='Message text CSS' />
                            <LongTextField name='customCss.messageContainer' label='Message container CSS' />
                        </>
                    </DisplayIf>
                </>
            ),
        },
    ];

    const displayModel = responseMetadata ? preprocessModel(responseMetadata) : preprocessModel(defaultModel);
    return (
        <div className='response-metadata-form'>
            <AutoForm model={displayModel} schema={new GraphQLBridge(schema, validator, schemaData)} onSubmit={model => onChange(postProcess(model))}>
                <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
                <br />
                <ErrorsField />
                <br />
                <SubmitField name='Save' />
            </AutoForm>
        </div>
    );
}

ResponseMetadataForm.propTypes = {
    responseMetadata: PropTypes.object,
    onChange: PropTypes.func.isRequired,
};

ResponseMetadataForm.defaultProps = {
    responseMetadata: {
        linksTarget: '_blank',
        userInput: 'show',
        messageTarget: 'conversation',
        domHighlight: {},
        customCss: {},
        pageChangeCallbacks: null,
    },
};

export default ResponseMetadataForm;
