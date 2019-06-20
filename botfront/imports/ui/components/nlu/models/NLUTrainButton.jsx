import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import { isTraining } from '../../../../api/nlu_model/nlu_model.utils';
import Can from '../../roles/Can';

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
        const { project, instance } = this.props;
        return (
            // <<<<<<< HEAD
            //             <Can I='nlu-model:x'>
            //                 <Button
            //                     color='blue'
            //                     icon='grid layout'
            //                     content='Train'
            //                     labelPosition='left'
            //                     disabled={isTraining(model) || !instance}
            //                     loading={isTraining(model)}
            //                     onClick={this.train}
            //                     compact
            //                     data-cy='train-button'
            //                 />
            //             </Can>
            // =======
            <Can I='nlu-model:x'>
                <Button
                    color='blue'
                    icon='grid layout'
                    content='Train'
                    labelPosition='left'
                    disabled={isTraining(project) || !instance}
                    loading={isTraining(project)}
                    onClick={this.train}
                    compact
                    data-cy='train-button'
                />
            </Can>
            // >>>>>>> 157df9e0d4dda4b72246ee085c3d96bb1d3962ba
        );
    }
}

NLUTrainButton.propTypes = {
    project: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    instance: PropTypes.object,
};

NLUTrainButton.defaultProps = {
    instance: null,
};

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

export default connect(
    mapStateToProps,
)(NLUTrainButton);
