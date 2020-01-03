
import React, { useState, useEffect } from 'react';
import { safeLoad, safeDump } from 'js-yaml';

import PropTypes from 'prop-types';

import AceEditor from 'react-ace';


const SequenceEditor = (props) => {
    const {
        content,
        onChange,
    } = props;
    const { custom } = content
    const [value, setValue] = useState(custom ? safeDump(custom) : '');
    useEffect(() => {
        const { custom } = content
        setValue(custom ? safeDump(custom) : '');
    }, [content])

    return (
        <div data-cy='custom-response-editor'>
            <AceEditor
                width='100%'
                minLines={25}
                maxLines={25}
                mode={'yaml'}
                theme='xcode'
                name={name}
                onChange={v => setValue(v)}
                onBlur={() => onChange({ ...content, custom: safeLoad(value) })}
                fontSize={16}
                showPrintMargin={false}
                showGutter
                highlightActiveLine
                value={value}
                editorsProps={{ $blockScrolling: true }}
                setOptions={{
                    enableBasicAutocompletion: false,
                    enableLiveAutocompletion: false,
                    enableSnippets: false,
                    showLineNumbers: false,
                    tabSize: 2,
                }}
            />
        </div>
    )
};

SequenceEditor.propTypes = {
    content: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default SequenceEditor;
