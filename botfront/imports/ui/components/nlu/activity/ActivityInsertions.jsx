import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    Button,
    Form,
    Message,
    TextArea,
    Tab,
} from 'semantic-ui-react';
import { wrapMeteorCallback } from '../../utils/Errors';

class ActivityInsertions extends React.Component {
    constructor(props) {
        super(props);
        this.maxLines = 50;

        this.state = {
            text: '',
            loading: false,
        };

        this.onTextChanged = this.onTextChanged.bind(this);
        this.saveExamples = this.saveExamples.bind(this);
    }

    onTextChanged(e, { value }) {
        const newText = value.split('\n').slice(0, this.maxLines).join('\n');

        this.setState({ text: newText });
    }

    saveExamples() {
        const { text } = this.state;
        const { projectId, modelId, instance } = this.props;
        
        this.setState({ loading: true });
        const examples = text.split('\n')
            .filter(t => !t.match(/^\s*$/))
            .map(t => ({ q: t }));
        Meteor.call('nlu.parse', projectId, modelId, instance, examples, false, wrapMeteorCallback((err) => {
            if (!err) return this.setState({ loading: false, text: '' });
            return this.setState({ loading: false });
        }));
    }

    render() {
        const { text, saving, loading } = this.state;

        return (
            <Tab.Pane>
                <Message info content='Add utterances below (one per line, 50 max). When you click on Add Utterances, they will be processed and the output will be shown in the New Utterances tab' />
                <br />
                <Form>
                    <TextArea
                        rows={15}
                        value={text}
                        autoHeight
                        disabled={saving}
                        onChange={this.onTextChanged}
                    />
                    <br />
                    <br />
                    <Button loading={loading} onClick={this.saveExamples} disabled={!text}>Add Utterances</Button>
                </Form>
            </Tab.Pane>
        );
    }
}

ActivityInsertions.propTypes = {
    modelId: PropTypes.string.isRequired,
    instance: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

export default connect(
    mapStateToProps,
)(ActivityInsertions);
