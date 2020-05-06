import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';

import NLUExampleTester from './NLUExampleTester';
import NLUExampleEditMode from './NLUExampleEditMode';
import { ExampleTextEditor } from './ExampleTextEditor';

export default class NLUPlayground extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    getInitialState = () => ({
        example: this.getEmptyExample(),
        exampleList: [],
        editMode: false,
    });

    getEmptyExample = () => ({ text: '', intent: '', entities: [] });

    onTextChanged = (example) => {
        this.setState({ example });
    };

    handleExampleTested = (example) => {
        this.setState({ example, editMode: true });
    };


    handleCancelExampleTested = () => {
        this.setState({ editMode: false });
        this.setState(this.getInitialState());
    };

    handleSaveExample = (example) => {
        this.props.onSave(example); // eslint-disable-line
        this.setState(this.getInitialState());
    };

    handleParseAndSave = () => {
        const {
            defaultIntent, instance, silenceRasaErrors, model: { language },
        } = this.props;
        const { example } = this.state;
        // treat new lines as new examples
        example.text.split('\n').forEach((exampleText) => {
            Meteor.call(
                'rasa.parse',
                instance,
                [{ text: exampleText, lang: language }],
                { failSilently: silenceRasaErrors },
                (err, exampleMatch) => {
                    if (err || !exampleMatch || !exampleMatch.intent) {
                        this.handleSaveExample({ ...example, intent: defaultIntent });
                        return;
                    }
                    const { intent: { name }, entities } = exampleMatch;
                    this.handleSaveExample({
                        ...example, text: exampleText, intent: name || defaultIntent, entities,
                    });
                },
            );
        });
    };

    render() {
        const {
            model, instance, projectId, intents, entities, testMode, saveOnEnter, silenceRasaErrors,
        } = this.props;
        const { example, example: { text } = {}, editMode } = this.state;

        const styleTextArea = {
            marginBottom: '10px',
        };
        const examples = example.text.split('\n');
        return (
            <div>
                {!editMode || examples.length > 1 ? (
                    <div>
                        <Form>
                            <ExampleTextEditor
                                highlightEntities={false}
                                style={styleTextArea}
                                example={example}
                                onChange={this.onTextChanged}
                                onEnter={saveOnEnter ? this.handleParseAndSave : () => {}}
                                allowMultiple
                            />
                        </Form>
                        {testMode && examples.length < 2 && (
                            <NLUExampleTester
                                text={text}
                                model={model}
                                instance={instance}
                                projectId={projectId}
                                entities={entities}
                                onDone={this.handleExampleTested}
                                disablePopup
                                silenceRasaErrors={silenceRasaErrors}
                            />
                        )}
                    </div>
                ) : (
                    <NLUExampleEditMode
                        floated='right'
                        intents={intents}
                        entities={entities}
                        example={example}
                        onSave={this.handleSaveExample}
                        onDelete={this.handleCancelExampleTested}
                        postSaveAction='close'
                    />
                )}
            </div>
        );
    }
}

NLUPlayground.propTypes = {
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

NLUPlayground.defaultProps = {
    testMode: false,
    defaultIntent: null,
    saveOnEnter: false,
    silenceRasaErrors: false,
};
