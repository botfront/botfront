import { AutoForm, ErrorsField } from 'uniforms-semantic';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
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
        this.state = { saving: false, saved: false, showConfirmation: false };
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
        const { saved, showConfirmation } = this.state;
        return (
            <AutoForm
                disabled={saving}
                schema={new SimpleSchema2Bridge(EndpointsSchema)}
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
                <AceField name='endpoints' label='Endpoints' mode='yaml' />
                <ErrorsField />
                {showConfirmation && (
                    <ChangesSaved
                        onDismiss={() => this.setState({ saved: false, showConfirmation: false })}
                        content={(
                            <p>
                                Run <b>botfront restart rasa</b> from your project&apos;s folder to apply changes.
                            </p>
                        )}
                    />
                )}
                <SaveButton saved={saved} saving={saving} />
            </AutoForm>
        );
    };

    renderLoading = () => <div />;

    render() {
        const { projectId, endpoints, ready } = this.props;
        const { saving } = this.state;
        if (ready) return this.renderEndpoints(saving, endpoints, projectId);
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
