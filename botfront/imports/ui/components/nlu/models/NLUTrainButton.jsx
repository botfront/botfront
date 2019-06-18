import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import { isTraining } from '../../../../api/nlu_model/nlu_model.utils';
import { Can } from '../../../../lib/scopes';

class NLUTrainButton extends React.Component {
    train = () => {
        const { model, instance, projectId } = this.props;
        Meteor.call('nlu.markTrainingStarted', model._id);
        Meteor.call('rasa.train', model._id, projectId, instance, (err) => {
            if (err) {
                Alert.error(`Training failed: ${JSON.stringify(err.reason)}`, {
                    position: 'top-right',
                    timeout: 'none',
                });
            }
        });
    }

    render() {
        const { model, instance } = this.props;
        return (
            <Can I='nlu-model:x'>
                <Button
                    color='blue'
                    icon='grid layout'
                    content='Train'
                    labelPosition='left'
                    disabled={isTraining(model) || !instance}
                    loading={isTraining(model)}
                    onClick={this.train}
                    compact
                    data-cy='train-button'
                />
            </Can>
        );
    }
}

NLUTrainButton.propTypes = {
    model: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    instance: PropTypes.object,
};

NLUTrainButton.defaultProps = {
    instance: null,
}

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

export default connect(
    mapStateToProps,
)(NLUTrainButton);
