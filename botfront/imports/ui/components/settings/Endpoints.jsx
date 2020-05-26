import { AutoForm, ErrorsField } from 'uniforms-semantic';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { cloneDeep, get } from 'lodash';
import React from 'react';
import { Menu } from 'semantic-ui-react';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { Endpoints as EndpointsCollection } from '../../../api/endpoints/endpoints.collection';
import { Projects as ProjectsCollection } from '../../../api/project/project.collection';
import { EndpointsSchema } from '../../../api/endpoints/endpoints.schema';
import { wrapMeteorCallback } from '../utils/Errors';
import ChangesSaved from '../utils/ChangesSaved';
import SaveButton from '../utils/SaveButton';
import AceField from '../utils/AceField';
import { can } from '../../../lib/scopes';
import ContextualSaveMessage from './ContextualSaveMessage';
import { ENVIRONMENT_OPTIONS } from '../constants.json';
import restartRasa from './restartRasa';

class Endpoints extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            saving: false,
            saved: false,
            showConfirmation: false,
            selectedEnvironment: 'development',
            webhook: {},
        };
        this.form = React.createRef();
    }


    componentDidMount() {
        const { projectId } = this.props;
        if (can('projects:w', projectId)) {
            Meteor.call('getRestartRasaWebhook', projectId, wrapMeteorCallback((err, result) => {
                if (err) return;
                const webhook = get(result, 'settings.private.webhooks.restartRasaWebhook', {});
                this.setState({ webhook });
            }));
        }
    }

    componentWillUnmount() {
        clearTimeout(this.sucessTimeout);
    }

    onSave = (endpoints) => {
        const newEndpoints = endpoints;
        const { selectedEnvironment, webhook } = this.state;
        const { projectId } = this.props;
        this.setState({ saving: true, showConfirmation: false });
        clearTimeout(this.sucessTimeout);
        if (!endpoints._id) {
            newEndpoints.projectId = projectId;
            newEndpoints.environment = selectedEnvironment;
        }
        Meteor.call(
            'endpoints.save',
            newEndpoints,
            wrapMeteorCallback((err) => {
                this.setState({ saving: false });
                if (!err) {
                    this.setState({ saved: true, showConfirmation: true });
                    this.sucessTimeout = setTimeout(() => {
                        this.setState({ saved: false });
                    }, 2 * 1000);
                }
            }),
        );
        if (selectedEnvironment && webhook && webhook.url) {
            restartRasa(projectId, webhook, selectedEnvironment);
        }
    };

    renderEndpoints = (saving, endpoints, projectId) => {
        const { saved, showConfirmation, selectedEnvironment } = this.state;
        const { orchestrator, webhook } = this.props;
        const hasWritePermission = can('projects:w', projectId);
        return (
            <AutoForm
                key={selectedEnvironment}
                disabled={!!saving || !hasWritePermission}
                schema={new SimpleSchema2Bridge(EndpointsSchema)}
                model={endpoints}
                onSubmit={this.onSave}
                ref={this.form}
                modelTransform={(mode, model) => {
                    const newModel = cloneDeep(model);
                    if (mode === 'validate' || mode === 'submit') {
                        // eslint-disable-next-line no-param-reassign
                        newModel.projectId = projectId;
                    }
                    return newModel;
                }}
            >
                <AceField name='endpoints' label='Endpoints' mode='yaml' data-cy='ace-field' />
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
                {hasWritePermission
                    && (
                        <SaveButton
                            saved={saved}
                            saving={saving}
                            disabled={!!saving}
                            onSave={(e) => { this.form.current.submit(); }}
                            confirmText={webhook && webhook.url ? `Saving will restart the ${selectedEnvironment} rasa instance` : ''}
                        />
                    )}
            </AutoForm>
        );
    };

    renderLoading = () => <div />;

    handleMenuItemClick = (event, environment) => {
        this.setState({ selectedEnvironment: environment, showConfirmation: false });
    }

    renderMenuItem = (environment) => {
        const { selectedEnvironment } = this.state;
        return (
            <Menu.Item
                key={environment}
                onClick={(e) => { this.handleMenuItemClick(e, environment); }}
                active={selectedEnvironment === environment}
                data-cy='environment-endpoints-tab'
            >
                {`${environment[0].toUpperCase()}${environment.slice(1)}`}
            </Menu.Item>
        );
    }

    renderMenu = () => {
        const { projectSettings } = this.props;
        if (!projectSettings.deploymentEnvironments) {
            return [this.renderMenuItem('development')];
        }
        const menuItemElements = ENVIRONMENT_OPTIONS.map((environment) => {
            if (projectSettings.deploymentEnvironments.includes(environment)) {
                return this.renderMenuItem(environment);
            }
            return <></>;
        });
        return [this.renderMenuItem('development'), ...menuItemElements];
    }

    renderContents = () => {
        const { endpoints, projectId } = this.props;
        const { selectedEnvironment, saving } = this.state;
        return this.renderEndpoints(saving, endpoints[selectedEnvironment], projectId);
    }

    render() {
        const { ready } = this.props;
        const { projectSettings } = this.props;
        if (ready) {
            const isMultipleTabs = projectSettings.deploymentEnvironments && projectSettings.deploymentEnvironments.length > 0;
            if (isMultipleTabs) {
                return (
                    <>
                        <Menu secondary pointing data-cy='endpoints-environment-menu'>
                            {this.renderMenu()}
                        </Menu>
                        {this.renderContents()}
                    </>
                );
            }
            return (
                <>
                    <h4 data-cy='endpoints-environment-menu'>Development</h4>
                    {this.renderContents()}
                </>
            );
        }
        return this.renderLoading();
    }
}

Endpoints.propTypes = {
    projectId: PropTypes.string.isRequired,
    endpoints: PropTypes.object,
    ready: PropTypes.bool.isRequired,
    orchestrator: PropTypes.string,
    projectSettings: PropTypes.object,
};

Endpoints.defaultProps = {
    endpoints: {},
    orchestrator: '',
    projectSettings: {},
};


const EndpointsContainer = withTracker(({ projectId }) => {
    const handler = Meteor.subscribe('endpoints', projectId);
    const projectSettings = ProjectsCollection.findOne(
        { _id: projectId },
        {
            fields: {
                deploymentEnvironments: 1,
            },
        },
    );
    const endpoints = {};
    EndpointsCollection.find({ projectId })
        .fetch()
        .filter(endpoint => (
            endpoint.environment === undefined || ENVIRONMENT_OPTIONS.includes(endpoint.environment)
        ))
        .forEach((endpoint) => {
            endpoints[endpoint.environment ? endpoint.environment : 'development'] = endpoint;
        });

    return {
        ready: handler.ready(),
        endpoints,
        projectSettings,
        webhook: {},
    };
})(Endpoints);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(EndpointsContainer);
