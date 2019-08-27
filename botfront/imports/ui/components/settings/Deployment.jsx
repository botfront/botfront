import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { AutoForm, SubmitField, ErrorsField } from 'uniforms-semantic';
import { ProjectsSchema as projectsSchemaDefault } from '../../../api/project/project.schema.default';
import { Projects } from '../../../api/project/project.collection';
import InfoField from '../utils/InfoField';
import { wrapMeteorCallback } from '../utils/Errors';
import { can } from '../../../lib/scopes';

class Deployment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            saving: false,
        };
    }

    onSave = (project) => {
        const {
            _id, deploymentEnvironments,
        } = project;
        this.setState({ saving: true });

        Meteor.call(
            'environment.update',
            {
                _id, deploymentEnvironments,
            },
            wrapMeteorCallback((err) => {
                if (!err) {
                    this.setState({ saving: false });
                }
            }, 'Changes saved'),
        );
    };

    HandleDevToStaging = () => {
        // eslint-disable-next-line no-console
        console.log('deploying from dev to staging');
    }

    handleStagingToProd = () => {
        // eslint-disable-next-line no-console
        console.log('deploying from staging to production');
    }

    render() {
        const { project, ready } = this.props;
        const { saving } = this.state;
        const projectsSchema = Projects.simpleSchema();
        const hasProjectWritePermission = !can('project-settings:w', project._id);
        return (
            <>
                {ready && (
                    <>
                        <AutoForm
                            schema={projectsSchema || projectsSchemaDefault}
                            model={project}
                            onSubmit={updateProject => this.onSave(updateProject)}
                            disabled={!!saving || hasProjectWritePermission}
                        >
                            

                            <InfoField
                                name='deploymentEnvironments'
                                label='Deployment environments'
                                info='Botfront will enable additional environments for your workflow'
                                data-cy='deployment-environments'
                            />
                            <br />
                            <ErrorsField />
                            <SubmitField
                                className='primary save-project-info-button'
                                value='Save Changes'
                                data-cy='save-changes'
                            />
                        </AutoForm>
                        <Button
                            onClick={this.HandleDevToStaging}
                            className='deployment-button'
                        >
                                Send development to staging
                        </Button>
                        <Button
                            onClick={this.handleStagingToProd}
                            className='deployment-button'
                        >
                            Send staging to production
                        </Button>
                    </>
                )}
            </>
        );
    }
}

Deployment.propTypes = {
    project: PropTypes.object.isRequired,
    ready: PropTypes.bool.isRequired,
};

const DeploymentContainer = withTracker(({ projectId }) => {
    const project = Projects.findOne(
        { _id: projectId },
        {
            fields: {
                name: 1,
                defaultLanguage: 1,
                deploymentEnvironments: 1,
            },
        },
    );
    if (!project) return browserHistory.replace({ pathname: '/404' });
    const projectsHandler = Meteor.subscribe('projects', projectId);
    const ready = projectsHandler.ready();
    return {
        ready,
        project,
    };
})(Deployment);

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

export default connect(mapStateToProps)(DeploymentContainer);
