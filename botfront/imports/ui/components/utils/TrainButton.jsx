import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import {
    Button, Popup, Icon, Checkbox,
} from 'semantic-ui-react';
import { get } from 'lodash';
import { wrapMeteorCallback } from './Errors';
import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import { Projects } from '../../../api/project/project.collection';

class TrainButton extends React.Component {
    copyToClipboard = () => {
        const { projectId } = this.props;
        const dummy = document.createElement('textarea');
        document.body.appendChild(dummy);
        dummy.value = `${window.location.origin.toString()}/chat/${projectId}/`;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
    }

    train = () => {
        const { projectId } = this.props;
        Meteor.call('project.markTrainingStarted', projectId);
        Meteor.call('rasa.train', projectId, wrapMeteorCallback());
    };

renderButton = (project, instance, popupContent, status, partialTrainning) => (
    <Popup
        content={popupContent}
        trigger={
            (
                <div>
                    <Button
                        color={partialTrainning ? 'yellow' : 'blue'}
                        icon={partialTrainning ? 'eye' : 'grid layout'}
                        content={partialTrainning ? 'Partial training' : 'Train everything'}
                        labelPosition='left'
                        disabled={status === 'training' || status === 'notReachable' || !instance}
                        loading={status === 'training'}
                        onClick={this.train}
                        data-cy='train-button'
                    />
                </div>
            )
        }
        // Popup is disabled while training
        disabled={status === 'training' || popupContent === ''}
        inverted
        size='tiny'
    />
);

    renderShareLink = () => {
        const {
            project: { enableSharing, _id: projectId },
        } = this.props;
        return (
            <Popup
                trigger={(
                    <Icon
                        name='mail forward'
                        data-cy='share-bot'
                        color='grey'
                        size='large'
                        link
                    />
                )}
                hoverable
                content={(
                    <div>
                        <Checkbox
                            toggle
                            checked={enableSharing}
                            data-cy='toggle-bot-sharing'
                            onChange={() => Meteor.call(
                                'project.setEnableSharing',
                                projectId,
                                !enableSharing,
                            )
                            }
                            label={enableSharing ? 'Sharing enabled' : 'Sharing disabled'}
                        />
                        {enableSharing && (
                            <p>
                                <br />
                                <button type='button' className='link-like' data-cy='copy-sharing-link' onClick={this.copyToClipboard}>
                                    <Icon name='linkify' /> Copy link
                                </button>
                            </p>
                        )}
                    </div>
                )}
            />
        );
    };

    render() {
        const {
            project, instance, popupContent, ready, status, partialTrainning,
        } = this.props;
        return (
            ready && (
                <div className='side-by-side middle'>
                    {this.renderButton(project, instance, popupContent, status, partialTrainning)}
                    {this.renderShareLink()}
                </div>
            )
        );
    }
}

TrainButton.propTypes = {
    project: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    instance: PropTypes.object,
    popupContent: PropTypes.string,
    status: PropTypes.string,
    partialTrainning: PropTypes.bool,
    ready: PropTypes.bool.isRequired,
};

TrainButton.defaultProps = {
    instance: null,
    popupContent: '',
    status: '',
    partialTrainning: false,
};

export default withTracker((props) => {
    // Gets the required number of selected storygroups and sets the content and popup for the train button
    const { projectId } = props;
    const trainingStatusHandler = Meteor.subscribe('training.status', projectId);
    const storyGroupHandler = Meteor.subscribe('storiesGroup', projectId);
    const ready = storyGroupHandler.ready() && trainingStatusHandler.ready();

    let storyGroups;
    let selectedStoryGroups;
    let popupContent = '';
    let status;
    let partialTrainning = false;
    if (ready) {
        status = Projects.findOne({ _id: projectId }, { field: { 'training.instanceStatus': 1 } });
        status = get(status, 'training.instanceStatus', 'notReachable'); // if it is undefined we consider it not reachable
        storyGroups = StoryGroups.find({ projectId }, { field: { _id: 1 } }).fetch();
        selectedStoryGroups = storyGroups.filter(storyGroup => (storyGroup.selected));
        partialTrainning = selectedStoryGroups.length > 0;
        if (partialTrainning && selectedStoryGroups.length > 1) popupContent = `Train NLU and stories from ${selectedStoryGroups.length} focused story groups.`;
        else if (selectedStoryGroups && selectedStoryGroups.length === 1) popupContent = 'Train NLU and stories from 1 focused story group.';
        else if (status === 'notReachable') popupContent = 'Rasa instance not reachable';
    }

    return {
        ready,
        popupContent,
        status,
        partialTrainning,
    };
})(TrainButton);
