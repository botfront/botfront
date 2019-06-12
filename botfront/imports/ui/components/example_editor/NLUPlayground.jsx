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

    render() {
        const {
            model, instance, projectId, intents, entities, testMode,
        } = this.props;
        const { example, example: { text } = {}, editMode } = this.state;

        const styleTextArea = {
            marginBottom: '10px',
        };

        return (
            <div>
                {!editMode ? (
                    <div>
                        <Form>
                            <ExampleTextEditor
                                highlightEntities={false}
                                style={styleTextArea}
                                example={example}
                                onChange={this.onTextChanged}
                            />
                        </Form>
                        {testMode && (
                            <NLUExampleTester
                                text={text}
                                model={model}
                                instance={instance}
                                projectId={projectId}
                                entities={entities}
                                onDone={this.handleExampleTested}
                                disablePopup
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
};

NLUPlayground.defaultProps = {
    testMode: false,
};
