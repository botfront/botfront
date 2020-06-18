import React from 'react';
import classnames from 'classnames';
import { Header } from 'semantic-ui-react';
import connectField from 'uniforms/connectField';
import filterDOMProps from 'uniforms/filterDOMProps';
import AceEditor from 'react-ace';
import yaml from 'js-yaml';
import 'brace/mode/yaml';
import 'brace/theme/xcode';
import 'brace/ext/language_tools';

function getValue(value, convertYaml = false, onChange = () => {}) {
    if (convertYaml) {
        // If value is an object we want to convert it to yaml
        // so that it can be displayed in AceEditor and then saved to that format
        if (value === Object(value)) {
            const stringValue = yaml.safeDump(value);
            // We call onChange here to be sure that the new value is saved
            onChange(stringValue);
            return stringValue;
        }
    }
    return value || '';
}

const AceField = ({
    className,
    disabled,
    error,
    errorMessage,
    id,
    inputRef,
    mode,
    fontSize,
    label,
    name,
    onChange,
    placeholder,
    required,
    showInlineError,
    value,
    convertYaml,
    ...props
}) => (
    <div className={classnames(className, { disabled, error, required }, 'field')} {...filterDOMProps(props)}>
        {label && (
            <Header as='h5'>{label}</Header>
        )}
        <AceEditor
            width='100%'
            minLines={25}
            maxLines={25}
            mode={mode || 'yaml'}
            theme='xcode'
            name={name}
            onChange={v => onChange(v)}
            fontSize={fontSize || 14}
            showPrintMargin={false}
            showGutter
            highlightActiveLine
            value={getValue(value, convertYaml, onChange)}
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
