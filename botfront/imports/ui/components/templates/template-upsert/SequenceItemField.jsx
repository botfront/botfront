/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import classnames from 'classnames';
import connectField from 'uniforms/connectField';
import filterDOMProps from 'uniforms/filterDOMProps';
import AceEditor from 'react-ace';
import 'brace/mode/yaml';
import 'brace/theme/github';
import {
    Label, List, Message, Tab,
} from 'semantic-ui-react';
import yaml from 'js-yaml';
import SyntaxHighlighter, { registerLanguage } from 'react-syntax-highlighter/light';
import yamlsyntax from 'react-syntax-highlighter/languages/hljs/yaml';
import github from 'react-syntax-highlighter/styles/hljs/github';
import {
    LegacyCarouselSchema,
    ImageSchema,
    QuickRepliesSchema,
    TextSchema,
    FBMButtonTemplateSchema,
    FBMGenericTemplateSchema,
    FBMListTemplateSchema,
    FBMHandoffTemplateSchema,
} from '../../../../api/project/response.schema';
import { examples } from './templateExamples';

const getExamples = i => (
    <SyntaxHighlighter style={github} language='yaml'>
        {yaml.safeDump(examples[i])}
    </SyntaxHighlighter>
);

registerLanguage('yaml', yamlsyntax);

const labels = (value, enableSubmit) => {
    let errors = [];
    let yamlError = null;
    const messageTypes = ['Text', 'Quick Replies', 'Image', 'Button template', 'Generic template', 'List template', 'Carousel (deprecated)', 'Messenger Handoff'];
    const schemas = [TextSchema, QuickRepliesSchema, ImageSchema, FBMButtonTemplateSchema, FBMGenericTemplateSchema, FBMListTemplateSchema, LegacyCarouselSchema, FBMHandoffTemplateSchema];
    schemas.map((s, i) => s.messageBox.messages({
        en: {
            keyNotInSchema: `The field "{{name}}" is not allowed in ${messageTypes[i].toLowerCase()} messages`,
        },
    }));
    const contexts = schemas.map(s => s.newContext());
    let valid = [];
    let hasError = false;
    try {
        let payload = yaml.safeLoad(value);
        if (typeof payload === 'string') payload = { text: payload };
        if (!value.includes(':')) {
            errors = Array(8).fill(['the response does not includes ":", use : for key/pair association']);
        }
        
        contexts.map(c => c.validate(payload));
        valid = contexts.map(c => (c.isValid() ? 1 : 0));
        hasError = valid.reduce((a, b) => a + b, 0) === 0;
        if (hasError) {
            contexts.map((context, i) => {
                const err = [];
                if (context.validationErrors()) {
                    context.validationErrors().map((e) => {
                        try {
                            let message = schemas[i].messageBox.message(e);
                            const field = message.match(/"(.*?)"/)[1];
                            const newfield = field.replace(/\.[0-9]\./g, ' > ');
                            message = message.replace(field, newfield);
                            return err.push(message);
                        } catch (e2) {
                            return console.log(e2);
                        }
                    });
                }
                return errors.push(err);
            });
        }
    } catch (e) {
        yamlError = e;
    }

    const marginTop = '0';
    function getErrors(i) {
        if (errors && errors.length > 0 && errors[i].length > 0) {
            return (
                <Message
                    header={`Are you trying to create a ${messageTypes[i]} message? Then correct the following:`}
                    content={(
                        <List bulleted>
                            {errors[i].map((e, i2) => (
                                <List.Item key={i2}>{e}</List.Item>
                            ))}
                        </List>
                    )}
                />
            );
        }
        return <div />;
    }

    function getPanes() {
        return messageTypes.map((s, i) => ({
            menuItem: s,
            render: () => (
                <Tab.Pane color='orange' size='mini' attached>
                    {getErrors(i)}
                    <br />
                    <strong>Here is an example of {messageTypes[i]} message:</strong>
                    {getExamples(i)}
                </Tab.Pane>
            ),
        }));
    }
    
    if (errors.length === 0 && !yamlError) {
        enableSubmit(true);

        const labelItems = messageTypes
            .filter((name, i) => valid[i])
            .map((name, i) => <Label className='message-format-confirm' key={i} basic size='mini' color='green' icon='check' pointing content={name} />);

        return <div style={{ marginTop }}>{labelItems}</div>;
    }
    const message = 'Invalid message. Select a message type below to get help';
    enableSubmit(false);
    return (
        <div style={{ marginLeft: '33px', marginTop: '10px' }}>
            <Label className='message-format-error' size='large' basic color='orange' icon='warning sign' pointing='below' content={message} />
            <Tab defaultActiveIndex={-1} menu={{ size: 'small' }} panes={getPanes()} />
        </div>
    );
};

const getHeight = value => `${Math.max(20, (value.split('\n').length) * 20)}px`;

const SequenceItemField = ({
    className, disabled, error, errorMessage, id, inputRef, label, name, onChange, placeholder, required, showInlineError, value, enableSubmit, ...props
}) => (
    <div className={classnames(className, { disabled, error, required }, 'field')} {...filterDOMProps(props)}>
        {label && <label>{label}</label>}
        <AceEditor
            width='100%'
            mode='yaml'
            theme='github'
            fontSize={14}
            id={id}
            wrapEnabled
            name={name}
            onChange={v => onChange(v)}
            placeholder={placeholder}
            height={getHeight(value)}
            highlightActiveLine
            ref={inputRef}
            value={value}
            setOptions={{
                showPrintMargin: false,
                showGutter: false,
                showLineNumbers: false,
                tabSize: 2,
            }}
        />

        {!!error && <div className='ui red basic pointing label'>{errorMessage}</div>}
        {labels(value, enableSubmit)}
    </div>
);
export default connectField(SequenceItemField);
