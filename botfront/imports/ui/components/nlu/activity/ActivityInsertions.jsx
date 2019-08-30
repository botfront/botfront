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
        const {
            projectId, model: { _id: modelId, language: lang }, instance, instance: { type },
        } = this.props;
        
        this.setState({ loading: true });
        
        
        if (type === 'nlu') {
            const examples = text.split('\n')
                .filter(t => !t.match(/^\s*$/))
                .map(t => ({ q: t }));

            return Meteor.call('nlu.parse', projectId, modelId, instance, examples, false, wrapMeteorCallback((err) => {
                if (!err) return this.setState({ loading: false, text: '' });
                return this.setState({ loading: false });
            }));
        }
        const examples = text.split('\n')
            .filter(t => !t.match(/^\s*$/))
            .map(t => ({ text: t, lang }));
        return Meteor.call('rasa.parse', instance, examples, false, wrapMeteorCallback((err) => {
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
                        autoheight='true'
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
    model: PropTypes.object.isRequired,
    instance: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

export default connect(
    mapStateToProps,
)(ActivityInsertions);
