import React from 'react';
import classnames from 'classnames';
import connectField from 'uniforms/connectField';
import filterDOMProps from 'uniforms/filterDOMProps';
import AceEditor from 'react-ace';
import brace from 'brace';
import 'brace/mode/yaml';
import 'brace/theme/xcode';

const AceField = ({
    className,
    disabled,
    error,
    errorMessage,
    id,
    inputRef,
    label,
    name,
    onChange,
    placeholder,
    required,
    showInlineError,
    value,
    ...props
}) => (
    <div className={classnames(className, { disabled, error, required }, 'field')} {...filterDOMProps(props)}>
        {label && (
            // eslint-disable-next-line jsx-a11y/label-has-associated-control
            <label>
                {label}
            </label>
        )}
        <AceEditor
            width='100%'
            mode={props.mode || 'yaml'}
            theme='xcode'
            name={name}
            onChange={v => onChange(v)}
            fontSize={props.fontSize || 14}
            showPrintMargin={false}
            showGutter
            highlightActiveLine
            value={value || ''}
            editorsProps={{ $blockScrolling: true }}
            setOptions={{
                enableBasicAutocompletion: false,
                enableLiveAutocompletion: false,
                enableSnippets: false,
                showLineNumbers: false,
                tabSize: 2,
            }}
        />

        {!!(error) && (
            <div className='ui red basic pointing label'>
                {errorMessage}
            </div>
        )}
    </div>
);

export default connectField(AceField);
