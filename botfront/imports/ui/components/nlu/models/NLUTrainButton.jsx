import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import { isTraining } from '../../../../api/nlu_model/nlu_model.utils';

class NLUTrainButton extends React.Component {
    train = () => {
        const { instance, projectId } = this.props;
        Meteor.call('project.markTrainingStarted', projectId);
        Meteor.call('rasa.train', projectId, instance, (err) => {
            if (err) {
                Alert.error(`Training failed: ${JSON.stringify(err.reason)}`, {
                    position: 'top-right',
                    timeout: 'none',
                });
            }
        });
    }

    render() {
        const { project, instance, content } = this.props;
        return (
            <Button
                color='blue'
                icon='grid layout'
                content={content}
                labelPosition='left'
                disabled={isTraining(project) || !instance}
                loading={isTraining(project)}
                onClick={this.train}
                compact
            />
        );
    }
}

NLUTrainButton.propTypes = {
    project: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    instance: PropTypes.object,
    content: PropTypes.string,
};

NLUTrainButton.defaultProps = {
    instance: null,
    content: 'Train',
};

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

export default connect(
    mapStateToProps,
)(NLUTrainButton);
