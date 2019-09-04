import { AutoForm, ErrorsField } from 'uniforms-semantic';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { cloneDeep } from 'lodash';
import React from 'react';
import { Menu } from 'semantic-ui-react';

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

class Endpoints extends React.Component {
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
        clearTimeout(this.sucessTimeout);
    }

    onSave = (endpoints) => {
        this.setState({ saving: true, showConfirmation: false });
        clearTimeout(this.sucessTimeout);
        Meteor.call(
            'endpoints.save',
            endpoints,
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
    };

    renderEndpoints = (saving, endpoints, projectId) => {
        const { saved, showConfirmation, selectedEnvironment } = this.state;
        const { orchestrator } = this.props;
        return (
            <AutoForm
                disabled={!!saving || !can('project-settings:w', projectId)}
                schema={EndpointsSchema}
                model={endpoints}
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
                <AceField name='endpoints' label='Endpoints' fontSize={12} mode='yaml' data-cy='ace-field' />
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
        console.log(endpoints);
        return this.renderEndpoints(saving, endpoints[selectedEnvironment], projectId);
    }


    render() {
        const { ready } = this.props;
        if (ready) {
            return (
                <>
                    <Menu pointing secondary data-cy='endpoints-environment-menu'>
                        {this.renderMenu()}
                    </Menu>
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
    const endpoints = {};
    endpoints.development = EndpointsCollection.findOne({ _id: projectId });
    ENVIRONMENT_OPTIONS.forEach((environment) => {
        endpoints[environment] = EndpointsCollection.findOne({ projectId, environment });
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
        ready: handler.ready(),
        endpoints,
        projectSettings,
    };
})(Endpoints);

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

export default connect(mapStateToProps)(EndpointsContainer);
