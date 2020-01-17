
import React, { useState, useEffect } from 'react';
import { safeLoad, safeDump } from 'js-yaml';

import PropTypes from 'prop-types';

import AceEditor from 'react-ace';


const SequenceEditor = (props) => {
    const {
        content,
        onChange,
    } = props;

    const cleanDump = (data) => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            return safeDump(data);
        }
        return ''; // display empty objects as an empty yaml editor rather than "{}"
    };

    const { __typename, __isCustom, ...initialValue } = content;
    const [value, setValue] = useState(cleanDump(initialValue));

    useEffect(() => {
        setValue(cleanDump(initialValue));
    }, [content]);

    const handleBlur = () => {
        onChange({ __typename, __isCustom, ...safeLoad(value) });
    };

    return (
        <div className='custom-response-editor' data-cy='custom-response-editor'>
            <AceEditor
                width='100%'
                minLines={10}
                maxLines={25}
                mode='yaml'
                theme='xcode'
                onChange={v => setValue(v)}
                onBlur={handleBlur}
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
    );
};

SequenceEditor.propTypes = {
    content: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default SequenceEditor;
