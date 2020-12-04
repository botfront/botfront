import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import {
    Button, Popup, Icon, Checkbox, Dropdown,
} from 'semantic-ui-react';
import { get } from 'lodash';
import Alert from 'react-s-alert';
import { wrapMeteorCallback } from './Errors';
import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import { Projects } from '../../../api/project/project.collection';
import { ProjectContext } from '../../layouts/context';
import { can, Can } from '../../../lib/scopes';
import { languages } from '../../../lib/languages';


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

    train = (target = 'development') => {
        const { projectId } = this.props;
        Meteor.call('project.markTrainingStarted', projectId);
        Meteor.call('rasa.train', projectId, target, wrapMeteorCallback());
    };

    runTests = (projectId, language) => {
        Meteor.call('stories.runTests', projectId, { language }, (error, response) => {
            if (error) {
                Alert.error(error.message);
            }
            const { passing, failing } = response;
            if (!failing) {
                Alert.success(`Test run complete. ${passing} test${passing !== 1 ? 's' : ''} passing`, {
                    position: 'top-right',
                    timeout: 10 * 1000,
                });
            } else {
                Alert.error(`
                    Test run complete. ${passing} test${passing !== 1 ? 's' : ''} passing, ${failing} test${failing !== 1 ? 's' : ''} failing`,
                {
                    position: 'top-right',
                    timeout: 10 * 1000,
                });
            }
        });
    }

    showModal = (env, visible) => {
        const modalOpen = this.state;
        this.setState({ modalOpen: { ...modalOpen, [env]: visible } });
    }

    renderDeploymentOptions = () => (<></>);

    renderTestingOptions = () => {
        const { language, projectId } = this.props;
        const languageName = languages[language]?.name;
        return (
            <>
                <Dropdown.Item onClick={() => this.runTests(projectId)} data-cy='run-all-tests'>
                    Run all tests
                </Dropdown.Item>
                {!!languageName && (
                    <Dropdown.Item onClick={() => this.runTests(projectId, language)} data-cy='run-lang-tests'>
                    Run all {languages[language]?.name} tests
                    </Dropdown.Item>
                )
                }
            </>
        );
    }

    renderDropdownMenu = trainingInProgress => (
        <Dropdown
            className='button icon'
            data-cy='train-and-deploy'
            floating
            disabled={trainingInProgress}
            trigger={<React.Fragment />}
        >
            <Dropdown.Menu>
                {this.renderTestingOptions()}
                {this.renderDeploymentOptions(trainingInProgress)}
            </Dropdown.Menu>
        </Dropdown>
    )

    renderButton = (instance, popupContent, status, partialTrainning) => (
        <Popup
            content={popupContent}
            trigger={
                (
                    <Button.Group color={partialTrainning ? 'yellow' : 'blue'}>
                        <Button
                            icon={partialTrainning ? 'eye' : 'grid layout'}
                            content={partialTrainning ? 'Partial training' : 'Train everything'}
                            labelPosition='left'
                            disabled={status === 'training' || status === 'notReachable' || !instance}
                            loading={status === 'training'}
                            onClick={() => { this.train(); }}
                            data-cy='train-button'
                        />
                        {this.renderDropdownMenu(status === 'training' || status === 'notReachable' || !instance)}
                    </Button.Group>
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
                basic
                hoverable
                content={(
                    <div>
                        <Checkbox
                            toggle
                            disabled={!can('share:x', projectId)}
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
            instance, popupContent, ready, status, partialTrainning,
        } = this.props;
        return (
            ready && (
                <div className='side-by-side middle'>
                    <Can I='nlu-data:x'>
                        {this.renderButton(instance, popupContent, status, partialTrainning)}
                    </Can>
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
    language: PropTypes.string.isRequired,
};

TrainButton.defaultProps = {
    instance: null,
    popupContent: '',
    status: '',
    partialTrainning: false,
};

const TrainWithContext = props => (
    <ProjectContext.Consumer>
        {({ project, language }) => (
            <TrainButton
                {...props}
                environments={project.deploymentEnvironments}
                language={language}
            />
        )}
    </ProjectContext.Consumer>
);


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
})(TrainWithContext);
