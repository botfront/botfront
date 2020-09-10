import React, { useState, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { Form, TextArea, Segment } from 'semantic-ui-react';
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
                (Array.isArray(res) ? res : [res]).map(({
                    intent, text, entities,
                }) => ({
                    text,
                    intent: intent && intent.name ? intent.name : defaultIntent,
                    entities,
                    metadata: { draft: !skipDraft },
                })),
            );
        },
    );

    const doSetParsedExample = useCallback(debounce(
        v => handleParse(setParsedExample, v.split('\n').slice(0, 1)), 500,
    ), []);

    function handleKeyPress(e) {
        const { key, shiftKey } = e;
        if (key === 'Enter' && !shiftKey) {
            e.stopPropagation();
            e.preventDefault();
            doSetParsedExample.cancel();
            handleParse(onSave, value.split('\n'));
            setValue('');
            setParsedExample(null);
        }
    }

    function handleBlur() {
        setValue('');
        setParsedExample(null);
    }

    function handleTextChange(e, data) {
        setValue(data.value);
        doSetParsedExample(data.value);
    }

    function render() {
        return (
            <div id='playground'>
                <Form>
                    <TextArea
                        name='text'
                        placeholder='User says...'
                        autoheight='true'
                        rows={(value && value.split('\n').length) || 1}
                        value={value}
                        onKeyPress={handleKeyPress}
                        onChange={handleTextChange}
                        onBlur={handleBlur}
                        data-cy='example-text-editor-input'
                    />
                </Form>
                {parsedExample && value.split('\n').length < 2 && (
                    <div className='tester' data-cy='nlu-example-tester'>
                        <Segment>
                            <UserUtteranceViewer
                                value={parsedExample[0]}
                                disableEditing
                            />
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
