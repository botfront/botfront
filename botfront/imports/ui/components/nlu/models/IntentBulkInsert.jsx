import React from 'react';
import PropTypes from 'prop-types';
import {
    Form, TextArea, Tab, Message, Button,
} from 'semantic-ui-react';

import IntentDropdown from '../../example_editor/IntentDropdown';
import SaveButton from '../../utils/SaveButton';

export default class IntentBulkInsert extends React.Component {
    static getInitialState() {
        return {
            text: '',
            intent: null,
            saving: false,
            saved: false,
        };
    }

    constructor(props) {
        super(props);
        this.props = props;
        this.state = IntentBulkInsert.getInitialState();

        this.onSaveExamples = this.onSaveExamples.bind(this);
        this.onTextChanged = this.onTextChanged.bind(this);
    }

    componentWillUnmount() {
        clearTimeout(this.succesTimeout);
    }

    onSaveExamples() {
        const { intent, text } = this.state;
        const { onNewExamples } = this.props;
        this.setState({ saving: true, saved: false });

        const examples = text
            .split('\n')
            .filter((item) => {
                const reg = /^\s*$/;
                return !reg.exec(item);
            })
            .map(t => ({ text: t, intent }));

        onNewExamples(examples, (err) => {
            if (!err) {
                this.setState(IntentBulkInsert.getInitialState());
                this.setState({ saved: true });
            } else {
                this.setState({ saving: false });
            }

            this.succesTimeout = setTimeout(() => {
                this.setState({ saved: false });
            }, 2 * 1000);
        });
    }

    onTextChanged(e) {
        this.setState({
            text: e.target.value,
        });
    }

    render() {
        const {
            text, saving, intent, saved,
        } = this.state;
        const { intents } = this.props;

        return (
            <Tab.Pane id='intent-bulk-insert'>
                <Message info content='One example per line' />
                <br />
                <Form>
                    <TextArea
                        className='batch-insert-input'
                        rows={15}
                        value={text}
                        autoheight='true'
                        disabled={saving}
                        onChange={this.onTextChanged}
                    />
                    <Message info content='Select an existing intent or type to create a new one' />
                    <IntentDropdown
                        intents={intents}
                        setIntent={newIntent => this.setState({ intent: newIntent })}
                    />
                    <Button.Group floated='right'>
                        <SaveButton
                            onSave={this.onSaveExamples}
                            disabled={!intent || !text}
                            saved={saved}
                        />
                    </Button.Group>
                </Form>
            </Tab.Pane>
        );
    }
}

IntentBulkInsert.propTypes = {
    intents: PropTypes.array.isRequired,
    onNewExamples: PropTypes.func.isRequired,
};
