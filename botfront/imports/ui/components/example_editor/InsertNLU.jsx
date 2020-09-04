import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Form, TextArea, Segment } from 'semantic-ui-react';
import { debounce } from 'lodash';
import UserUtteranceViewer from '../nlu/common/UserUtteranceViewer';


function InsertNlu(props) {
    const {
        model: { language }, instance, silenceRasaErrors, onSave, defaultIntent,
    } = props;
    const [examples, setExamples] = useState('');
    const [parsedExample, setParsedExample] = useState(null);
    

    function handleParse(example) {
        Meteor.call(
            'rasa.parse',
            instance,
            [{ text: example, lang: language }],
            { failSilently: silenceRasaErrors },
            (err, exampleMatch) => {
                if (err || !exampleMatch || !exampleMatch.intent) {
                    setParsedExample({ text: example, intent: defaultIntent });
                }
                const { intent: { name }, entities } = exampleMatch;
                setParsedExample({ text: example, intent: name, entities });
            },
        );
    }

    const debouncedParse = useCallback(debounce(handleParse, 500), []);
    
    function onEnter(newExamples) {
        debouncedParse.cancel();
        onSave(newExamples.split('\n'));
        setExamples('');
        setParsedExample(null);
    }

    function handleKeyPress(e) {
        const {
            key, shiftKey,
        } = e;
    
        if (key === 'Enter' && !shiftKey) {
            e.stopPropagation();
            e.preventDefault();
            onEnter(examples);
        }
    }


    function handleBlur() {
        setExamples('');
        setParsedExample(null);
    }


    function handleTextChange(e, data) {
        setExamples(data.value);
        if (data.value.split('\n').length < 2) {
            debouncedParse(data.value);
        } else {
            setParsedExample(null);
        }
    }
   

    function render() {
        return (
            <>
                <Form>
                    <TextArea
                        name='text'
                        placeholder='User says...'
                        autoheight='true'
                        rows={(examples && examples.split('\n').length) || 1}
                        value={examples}
                        onKeyPress={handleKeyPress}
                        onChange={handleTextChange}
                        onBlur={handleBlur}
                        data-cy='example-text-editor-input'
                    />
                </Form>
                {parsedExample !== null && (
                    <div className='tester' data-cy='nlu-example-tester'>
                    
                        <Segment>
                            <UserUtteranceViewer
                                value={parsedExample}
                                disableEditing
                            />
                        </Segment>
                    </div>

                )}
                
               
            </>
                       
        );
    }
    return render();
}

InsertNlu.propTypes = {
    intents: PropTypes.array.isRequired,
    entities: PropTypes.array.isRequired,
    onSave: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
    instance: PropTypes.object.isRequired,
    testMode: PropTypes.bool,
    defaultIntent: PropTypes.string,
    saveOnEnter: PropTypes.bool,
    silenceRasaErrors: PropTypes.bool,
};

InsertNlu.defaultProps = {
    testMode: false,
    defaultIntent: null,
    saveOnEnter: false,
    silenceRasaErrors: false,
};

export default InsertNlu;
