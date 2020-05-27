import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import {
    Button, Popup, Dropdown, Confirm,
} from 'semantic-ui-react';
import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import { get } from 'lodash';
import { wrapMeteorCallback } from './Errors';
import { isTraining } from '../../../api/nlu_model/nlu_model.utils';
import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import { Can, can } from '../../../lib/scopes';
import { ProjectContext } from '../../layouts/context';


class TrainButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalOpen: { production: false, staging: false },
            webhooks: {},
        };
    }

    componentDidMount() {
        const { projectId } = this.props;
        if (can('projects:w', projectId)) {
            Meteor.call('getDeploymentWebhook', projectId, wrapMeteorCallback((err, result) => {
                if (err) return;
                const webhook = get(result, 'settings.private.webhooks.deploymentWebhook', {});
                this.setState({ webhook });
            }));
        }
    }

    train = async (target = 'development', loadModel = true) => {
        const { instance, projectId } = this.props;
        Meteor.call('project.markTrainingStarted', projectId);
        // a promise is needed so we are able to wait for training to finish before trying to deploy the trained model
        await new Promise((resolve, reject) => {
            Meteor.call('rasa.train', projectId, instance, target, loadModel, wrapMeteorCallback((err) => {
                if (err) {
                    reject(new Error());
                }
                resolve();
            }));
        });
    }

    showModal = (env, visible) => {
        const modalOpen = this.state;
        this.setState({ modalOpen: { ...modalOpen, [env]: visible } });
    }

    renderDeployDropDown = (trainingInProgress) => {
        const { environments } = this.props;
        const { webhook } = this.state;
        
        const deployOptions = [];
        const { modalOpen } = this.state;
        // there is no webhooks or environments so we don't render the deployment menu
        if (!(webhook && webhook.url)) return (<></>);
        if (!(environments && environments.length > 0)) return (<></>);


        if (webhook.url && environments.includes('staging')) {
            deployOptions.push({
                key: 'staging', text: 'Deploy to staging', value: 'staging',
            });
        }
        if (webhook.url && environments.includes('production')) {
            deployOptions.push({
                key: 'prod', text: 'Deploy to production', value: 'production',
            });
        }

        if (deployOptions.length > 0) {
            // explicitly define the dropdown so we don't get the highlighted selection
            return (
                <Dropdown
                    className='button icon'
                    data-cy='train-and-deploy'
                    floating
                    disabled={trainingInProgress}
                    trigger={<React.Fragment />}
                >
                    <Dropdown.Menu>
                        {deployOptions.map(opt => (
                            <>
                                <Dropdown.Item
                                    value={opt.value}
                                    key={opt.key}
                                    onClick={() => { this.showModal(opt.value, true); }}
                                >
                                    {opt.text}
                                </Dropdown.Item>
                                <Confirm
                                    open={modalOpen[opt.value]}
                                    //                                                   we need to stop the propagation, otherwise it reopen the dropdown
                                    onCancel={(e) => { this.showModal(opt.value, false); e.stopPropagation(); }}
                                    onConfirm={(e) => { this.trainAndDeploy(opt.value); this.showModal(opt.value, false); e.stopPropagation(); }}
                                    content={`Do you really want to deploy your project to ${opt.value}`}
                                />
                            </>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>

            );
        }
        return (<></>);
    }

    deploy = (target) => {
        const { projectId } = this.props;
        const { webhook } = this.state;
        try {
            if (!webhook.url || !webhook.method) throw new Error('Deployment failed: the webhook parameters are missing');
            if (!target) throw new Error('Deployment failed: the deployment target is missing');


            Meteor.call('deploy.model', projectId, target, (err, response) => {
                if (err || response === undefined || response.status !== 200) {
                    Alert.error(`Deployment failed: ${err.message}`, {
                        position: 'top-right',
                        timeout: 10000,
                    });
                }
                if (response.status === 200) {
                    Alert.success(`Your project has been deployed to the ${target} environment`, {
                        position: 'top-right',
                        timeout: 5000,
                    });
                }
            });
        } catch (e) {
            Alert.error(e.message, {
                position: 'top-right',
                timeout: 10000,
            });
        }
    }

    trainAndDeploy = async (target) => {
        try {
            const loadModel = target === 'development'; // automaticly load the model only if we are in development
            await this.train(target, loadModel);
            Alert.info(`Deployment to ${target} has started`, {
                position: 'top-right',
                timeout: 5000,
            });
            this.deploy(target);
        } catch (e) {
            Alert.error('Cannot deploy, training failed', {
                position: 'top-right',
                timeout: 3000,
            });
        }
    }


    renderButton = (project, instance, popupContent) => (
        !popupContent ? (
            <Button.Group color='blue'>
                <Button
                    icon='grid layout'
                    content='Train everything'
                    labelPosition='left'
                    disabled={isTraining(project) || !instance}
                    loading={isTraining(project)}
                    onClick={() => { this.train(); }}
                    compact
                    data-cy='train-button'
                />
                {this.renderDeployDropDown(isTraining(project))}
            </Button.Group>
        ) : (
            <Button.Group color='yellow'>
                <Popup
                    content={popupContent}
                    trigger={
                        (
                            <Button
                                icon='eye'
                                content='Partial training'
                                labelPosition='left'
                                disabled={isTraining(project) || !instance}
                                loading={isTraining(project)}
                                onClick={() => { this.train(); }}
                                compact
                                data-cy='train-button'
                            />
                        )
                    }
                    // Popup is disabled while training
                    disabled={project.training && project.training.status === 'training'}
                    inverted
                    size='tiny'
                />
                {this.renderDeployDropDown(isTraining(project))}

            </Button.Group>
        )
    );

    render() {
        const {
            project,
            instance,
            popupContent,
            ready,
        } = this.props;
        return ready && (
            <Can I='nlu-data:x'>
                {this.renderButton(project, instance, popupContent)}
            </Can>
        );
    }
}

TrainButton.propTypes = {
    project: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    instance: PropTypes.object,
    popupContent: PropTypes.string,
    ready: PropTypes.bool.isRequired,
    environments: PropTypes.array,
};

TrainButton.defaultProps = {
    instance: null,
    popupContent: '',
    environments: [],
};

const TrainWithContext = props => (
    <ProjectContext.Consumer>
        {({ project }) => (
            <TrainButton
                {...props}
                environments={project.deploymentEnvironments}
            />
        )}
    </ProjectContext.Consumer>
);


export default withTracker((props) => {
    // Gets the required number of selected storygroups and sets the content and popup for the train button
    const { projectId } = props;
    const storyGroupHandler = Meteor.subscribe('storiesGroup', projectId);
    const ready = storyGroupHandler.ready();

    let storyGroups;
    let selectedStoryGroups;
    let popupContent;


    if (ready) {
        storyGroups = StoryGroups.find({ projectId }, { field: { _id: 1 } }).fetch();
        selectedStoryGroups = storyGroups.filter(storyGroup => (storyGroup.selected));

        if (selectedStoryGroups && selectedStoryGroups.length > 1) popupContent = `Train NLU and stories from ${selectedStoryGroups.length} focused story groups.`;
        else if (selectedStoryGroups && selectedStoryGroups.length === 1) popupContent = 'Train NLU and stories from 1 focused story group.';
    }

    return {
        ready,
        popupContent,
    };
})(TrainWithContext);
