import React, { useState, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { Form, Segment } from 'semantic-ui-react';
import TextArea from 'react-textarea-autosize';
import { debounce } from 'lodash';
import UserUtteranceViewer from '../nlu/common/UserUtteranceViewer';
import { ProjectContext } from '../../layouts/context';

function InsertNlu(props) {
    const { onSave, defaultIntent, skipDraft } = props;
    const { language, instance } = useContext(ProjectContext);
    const [value, setValue] = useState('');
    const [parsedExample, setParsedExample] = useState(null);

    const handleParse = (func, v) => Meteor.call(
        'rasa.parse',
        instance,
        v.map(text => ({ text, lang: language })),
        { failSilently: true },
        (err, res) => {
            if (err || !res) {
                return func(
                    v.map(text => ({
                        text,
                        metadata: { draft: !skipDraft },
                        intent: defaultIntent,
                    })),
                );
            }
            return func(
                (Array.isArray(res) ? res : [res]).map(
                    ({ intent, text, entities }) => ({
                        _id: shortid.generate(),
                        text,
                        intent: intent?.name ? intent.name : defaultIntent,
                        confidence: intent?.confidence,
                        entities,
                        metadata: { draft: !skipDraft },
                    }),
                ),
            );
        },
    );

    const doSetParsedExample = useCallback(
        debounce(v => handleParse(setParsedExample, v.split('\n').slice(0, 1)), 500),
        [],
    );

    function handleKeyPress(e) {
        const { key, shiftKey } = e;
        if (key === 'Enter' && !shiftKey) {
            e.stopPropagation();
            e.preventDefault();
            doSetParsedExample.cancel();
            handleParse(
                onSave,
                value.split('\n').filter(l => l.trim()),
            );
            setValue('');
            setParsedExample(null);
        }
    }

    function handleBlur() {
        setValue('');
        setParsedExample(null);
    }

    function handleTextChange(e) {
        setValue(e.target.value);
        doSetParsedExample(e.target.value);
    }

    function render() {
        return (
            <div id='playground'>
                <Form>
                    <TextArea
                        placeholder='User says...'
                        minRows={1}
                        maxRows={999}
                        value={value}
                        onKeyPress={handleKeyPress}
                        onChange={handleTextChange}
                        onBlur={handleBlur}
                        data-cy='example-text-editor-input'
                    />
                </Form>
                {(parsedExample
                    || value.split('\n').filter(l => l.trim()).length >= 2) && (
                    <div className='tester' data-cy='nlu-example-tester'>
                        <Segment>
                            {parsedExample && value.split('\n').length < 2 && (
                                <>
                                    <UserUtteranceViewer
                                        value={parsedExample[0]}
                                        disableEditing
                                    />
                                    {parsedExample[0]?.confidence ? (
                                        <span className='small grey'>
                                            (
                                            {(parsedExample[0].confidence * 100).toFixed(
                                                2,
                                            )}
                                            %)
                                        </span>
                                    ) : null}
                                </>
                            )}
                            <div className='instructions'>
                                Press [Enter] to add or edit example
                                {value.split('\n').filter(l => l.trim()).length >= 2
                                    && 's'}
                                .
                            </div>
                        </Segment>
                    </div>
                )}
            </div>
        );
    }
    return render();
}

InsertNlu.propTypes = {
    onSave: PropTypes.func.isRequired,
    defaultIntent: PropTypes.string,
    skipDraft: PropTypes.bool,
};

InsertNlu.defaultProps = {
    defaultIntent: null,
    skipDraft: false,
};

export default InsertNlu;
