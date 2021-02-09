import { AutoForm, ErrorsField } from 'uniforms-semantic';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { cloneDeep, get } from 'lodash';
import React from 'react';
import { Menu } from 'semantic-ui-react';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { safeLoad } from 'js-yaml';
import { Endpoints as EndpointsCollection } from '../../../api/endpoints/endpoints.collection';
import { Projects as ProjectsCollection } from '../../../api/project/project.collection';
import { EndpointsSchema } from '../../../api/endpoints/endpoints.schema';
import { wrapMeteorCallback } from '../utils/Errors';
import ChangesSaved from '../utils/ChangesSaved';
import SaveButton from '../utils/SaveButton';
import AceField from '../utils/AceField';
import { can } from '../../../lib/scopes';
import { ENVIRONMENT_OPTIONS } from '../constants.json';
import restartRasa from './restartRasa';
import HttpRequestsForm from '../common/HttpRequestsForm';

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

    callRestartRasa = () => {
        const { selectedEnvironment, webhook } = this.state;
        const { projectId } = this.props;
        if (selectedEnvironment && webhook && webhook.url) {
            restartRasa(projectId, webhook, selectedEnvironment);
        }
    }

    onSave = (endpoints) => {
        const { selectedEnvironment: environment } = this.state;
        const { projectId } = this.props;
        this.setState({ saving: true, showConfirmation: false });
        clearTimeout(this.sucessTimeout);
        Meteor.call(
            'endpoints.save',
            { ...endpoints, projectId, environment },
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
        this.callRestartRasa();
    };

    checkEnvironmentEnabled = (environment) => {
        const { projectSettings } = this.props;
        if (environment === 'development') return true;
        return projectSettings.deploymentEnvironments.includes(environment);
    }


    handleActionEndpointSave = (value, callback) => {
        const { projectId } = this.props;
        const { selectedEnvironment } = this.state;
        if (!value[selectedEnvironment]) {
            callback(new Error('Actions server not saved'));
        }
        Meteor.call('actionsEndpoints.save', projectId, selectedEnvironment, value[selectedEnvironment].url, (...args) => {
            callback(...args);
            this.callRestartRasa();
        });
    }

    renderActionEndpoints = (saving, data, projectId) => {
        const { selectedEnvironment } = this.state;
        if (!data) return <></>;
        const endpointSettings = safeLoad(data.endpoints);
        const urls = {
            [selectedEnvironment]: {
                name: 'Actions Server',
                url: endpointSettings.action_endpoint.url,
            },
        };
        return (
            <HttpRequestsForm
                disableMethodField
                onSave={this.handleActionEndpointSave}
                editable={can('projects:w', projectId)}
                urls={urls}
            />
        );
    }

    renderEndpoints = (saving, endpoints, projectId) => {
        const {
            saved, showConfirmation, selectedEnvironment, webhook,
        } = this.state;
        const hasWritePermission = can('resources:w', projectId);
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
                            <p />
                        )}
                    />
                )}
                {hasWritePermission
                    && (
                        <SaveButton
                            saved={saved}
                            saving={saving}
                            disabled={!!saving}
                            onSave={() => { this.form.current.submit(); }}
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
        return (
            <>
                {((!can('resources:w', projectId) && can('projects:w', projectId))
                || !can('resources:r', projectId))
                && this.renderActionEndpoints(saving, endpoints[selectedEnvironment], projectId)
                }
                {can('resources:r', projectId) && this.renderEndpoints(saving, endpoints[selectedEnvironment], projectId)}
            </>
        );
    }

    render() {
        const { projectSettings } = this.props;
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
}

Endpoints.propTypes = {
    projectId: PropTypes.string.isRequired,
    endpoints: PropTypes.object,
    ready: PropTypes.bool.isRequired,
    projectSettings: PropTypes.object,
};

Endpoints.defaultProps = {
    endpoints: {},
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
    };
})(Endpoints);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(EndpointsContainer);
