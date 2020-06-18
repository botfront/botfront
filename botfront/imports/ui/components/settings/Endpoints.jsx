import { AutoForm, ErrorsField } from 'uniforms-semantic';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import { Input, Header, Tab } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { cloneDeep } from 'lodash';
import React from 'react';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';

import { Endpoints as EndpointsCollection } from '../../../api/endpoints/endpoints.collection';
import { EndpointsSchema } from '../../../api/endpoints/endpoints.schema';
import { wrapMeteorCallback } from '../utils/Errors';
import ChangesSaved from '../utils/ChangesSaved';
import SaveButton from '../utils/SaveButton';
import AceField from '../utils/AceField';

class Endpoints extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            saving: false,
            saved: false,
            showConfirmation: false,
            actionEndpoint: '',
        };
    }

    componentDidUpdate(prevProps) {
        const { endpoints: { actionEndpoint = '' } = {} } = this.props;
        const { endpoints: { actionEndpoint: prevActionEndpoint = '' } = {} } = prevProps;
        if (prevActionEndpoint !== actionEndpoint) this.setState({ actionEndpoint });
    }

    componentWillUnmount() {
        clearTimeout(this.sucessTimeout);
    }

    onSave = which => (data) => {
        const method = which === 'endpoints' ? 'endpoints.save' : 'actionEndpoint.save';
        this.setState({ saving: true, showConfirmation: false });
        clearTimeout(this.sucessTimeout);
        Meteor.call(
            method,
            data,
            wrapMeteorCallback((err) => {
                this.setState({ saving: false });
                if (!err) {
                    this.setState({ saved: which, showConfirmation: true });
                    this.sucessTimeout = setTimeout(() => {
                        this.setState({ saved: false });
                    }, 2 * 1000);
                }
            }),
        );
    };

    renderEndpoints = () => {
        const { endpoints, projectId } = this.props;
        const { saving, saved } = this.state;
        return (
            <AutoForm
                disabled={saving}
                schema={new SimpleSchema2Bridge(EndpointsSchema)}
                model={endpoints}
                onSubmit={this.onSave('endpoints')}
                modelTransform={(mode, model) => {
                    const newModel = cloneDeep(model);
                    if (mode === 'validate' || mode === 'submit') {
                        // eslint-disable-next-line no-param-reassign
                        newModel.projectId = projectId;
                    }
                    return newModel;
                }}
            >
                <AceField name='endpoints' label='Endpoints' mode='yaml' />
                <ErrorsField />
                <SaveButton saved={saved === 'endpoints'} saving={saving} />
            </AutoForm>
        );
    };

    renderActionEndpoint = () => {
        const { saving, saved, actionEndpoint } = this.state;
        const { endpoints: { _id, projectId } } = this.props;
        return (
            <>
                <Header as='h5'>Action Endpoint</Header>
                <div className='side-by-side'>
                    <Input
                        value={actionEndpoint}
                        onChange={(_, { value }) => this.setState({ actionEndpoint: value })}
                        disabled={saving}
                        style={{ width: '100%' }}
                    />
                    <SaveButton
                        saved={saved === 'actionEndpoint'}
                        saving={saving}
                        onSave={() => this.onSave('actionEndpoint')({
                            _id,
                            projectId,
                            actionEndpoint,
                        })}
                    />
                </div>
            </>
        );
    };

    renderLoading = () => <div />;

    render() {
        const { ready } = this.props;
        const { showConfirmation } = this.state;
        if (ready) {
            return (
                <>
                    <Tab.Pane>{this.renderActionEndpoint()}</Tab.Pane>
                    <Tab.Pane>{this.renderEndpoints()}</Tab.Pane>
                    {showConfirmation && (
                        <ChangesSaved
                            onDismiss={() => this.setState({ saved: false, showConfirmation: false })
                            }
                            content={(
                                <p>
                                    Run <b>botfront restart rasa</b> from your
                                    project&apos;s folder to apply changes.
                                </p>
                            )}
                        />
                    )}
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
};

Endpoints.defaultProps = {
    endpoints: {},
};

const EndpointsContainer = withTracker(({ projectId }) => {
    const handler = Meteor.subscribe('endpoints', projectId);
    const endpoints = EndpointsCollection.findOne({ projectId });

    return {
        ready: handler.ready(),
        endpoints,
    };
})(Endpoints);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(EndpointsContainer);
