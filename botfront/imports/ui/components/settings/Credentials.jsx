import { AutoForm, ErrorsField } from 'uniforms-semantic';
import { withTracker } from 'meteor/react-meteor-data';
import 'react-s-alert/dist/s-alert-default.css';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { Menu } from 'semantic-ui-react';

import { CredentialsSchema, Credentials as CredentialsCollection } from '../../../api/credentials';
import { Projects as ProjectsCollection } from '../../../api/project/project.collection';
import { wrapMeteorCallback } from '../utils/Errors';
import ChangesSaved from '../utils/ChangesSaved';
import SaveButton from '../utils/SaveButton';
import AceField from '../utils/AceField';
import { can } from '../../../lib/scopes';
import ContextualSaveMessage from './ContextualSaveMessage';

import { ENVIRONMENT_OPTIONS } from '../constants.json';

class Credentials extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            saving: false,
            saved: false,
            showConfirmation: false,
            selectedEnvironment: 'development',
        };
    }

    componentWillUnmount() {
        clearTimeout(this.successTimeout);
    }

    onSave = (credentials) => {
        this.setState({ saving: true, showConfirmation: false });
        clearTimeout(this.successTimeout);
        Meteor.call(
            'credentials.save',
            credentials,
            wrapMeteorCallback((err) => {
                if (!err) {
                    this.setState({ saved: true });
                    this.successTimeout = setTimeout(() => {
                        this.setState({ saved: false });
                    }, 2 * 1000);
                }
                this.setState({ saving: false, showConfirmation: true });
            }),
        );
    };

    renderCredentials = (saving, credentials, projectId, environment) => {
        const { saved, showConfirmation, selectedEnvironment } = this.state;
        const { orchestrator } = this.props;
        return (
            <AutoForm
                disabled={!!saving || !can('project-settings:w', projectId)}
                schema={CredentialsSchema}
                model={credentials}
                onSubmit={this.onSave}
                modelTransform={(mode, model) => {
                    const newModel = cloneDeep(model);
                    if (mode === 'validate' || mode === 'submit') {
                        // eslint-disable-next-line no-param-reassign
                        newModel.projectId = projectId;
                    }
                    return newModel;
                }}
            >
                {environment}
                <AceField name='credentials' label='Credentials' fontSize={12} mode='yaml' data-cy='ace-field' />
                <ErrorsField />
                {showConfirmation && (
                    <ChangesSaved
                        onDismiss={() => this.setState({ saved: false, showConfirmation: false })}
                        content={(
                            <p>
                                {orchestrator === 'docker-compose' && (
                                    <span>
                                        <ContextualSaveMessage selectedEnvironment={selectedEnvironment} />
                                    </span>
                                )}
                            </p>
                        )}
                    />
                )}
                <SaveButton saved={saved} saving={saving} disabled={!!saving || !can('project-settings:w', projectId)} />
            </AutoForm>
        );
    };

    renderLoading = () => <div />;

    renderMenuItem = (environment) => {
        const { selectedEnvironment } = this.state;
        return (
            <Menu.Item
                key={environment}
                onClick={() => { this.setState({ selectedEnvironment: environment, showConfirmation: false }); }}
                active={selectedEnvironment === environment}
                data-cy='environment-credentials-tab'
            >
                {`${environment[0].toUpperCase()}${environment.slice(1)}`}
            </Menu.Item>
        );
    }

    renderMenu = () => {
        const { projectSettings } = this.props;
        const menuItemElements = ENVIRONMENT_OPTIONS.map((environment, i) => {
            if (!projectSettings.deploymentEnvironments) {
                return this.renderMenuItem('development' + i);
            }
            if (projectSettings.deploymentEnvironments.includes(environment)) {
                return this.renderMenuItem(environment);
            }
            return <></>;
        });
        return [this.renderMenuItem('development'), ...menuItemElements];
    }

    renderContents = () => {
        const { credentials, projectId } = this.props;
        const { selectedEnvironment, saving } = this.state;
        return this.renderCredentials(saving, credentials[selectedEnvironment], projectId);
    };

    render() {
        const { ready } = this.props;
        if (ready) {
            return (
                <>
                    <Menu pointing secondary data-cy='credentials-environment-menu'>{this.renderMenu()}</Menu>
                    {this.renderContents()}
                </>
            );
        }
        
        return this.renderLoading();
    }
}

Credentials.propTypes = {
    projectId: PropTypes.string.isRequired,
    credentials: PropTypes.object,
    projectSettings: PropTypes.object,
    ready: PropTypes.bool.isRequired,
    orchestrator: PropTypes.string,
};

Credentials.defaultProps = {
    projectSettings: {},
    orchestrator: '',
    credentials: {},
};

const CredentialsContainer = withTracker(({ projectId }) => {
    const handler = Meteor.subscribe('credentials', projectId);
    const handlerproj = Meteor.subscribe('projects', projectId);
    const credentials = {};
    ENVIRONMENT_OPTIONS.forEach((environment) => {
        credentials[environment] = CredentialsCollection.findOne({ projectId, environment });
    });
    const projectSettings = ProjectsCollection.findOne(
        { _id: projectId },
        {
            fields: {
                deploymentEnvironments: 1,
            },
        },
    );
    return {
        ready: (handler.ready() && handlerproj.ready()),
        credentials,
        projectSettings,
    };
})(Credentials);

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

export default connect(mapStateToProps)(CredentialsContainer);
