
import React, { useState, useEffect } from 'react';
import { safeDump, safeLoad } from 'js-yaml';

import PropTypes from 'prop-types';

import AceEditor from 'react-ace';


const CustomResponseEditor = (props) => {
    const {
        content,
        onChange,
    } = props;
    const { __typename, metadata, ...contentMinusTypeNameAndMetadata } = content;
    const [value, setValue] = useState(contentMinusTypeNameAndMetadata ? safeDump(contentMinusTypeNameAndMetadata) : '');
    useEffect(() => {
        setValue(contentMinusTypeNameAndMetadata ? safeDump(contentMinusTypeNameAndMetadata) : '');
    }, [content]);

    const handleSave = (e) => {
        try {
            onChange({ payload: { ...safeLoad(value), __typename, metadata } });
        } catch (error) {
            e.preventDefault();
        }
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
                onBlur={handleSave}
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

CustomResponseEditor.propTypes = {
    content: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default CustomResponseEditor;
