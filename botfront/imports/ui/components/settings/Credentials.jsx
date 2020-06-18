import { AutoForm, ErrorsField } from 'uniforms-semantic';
import { withTracker } from 'meteor/react-meteor-data';
import 'react-s-alert/dist/s-alert-default.css';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';

import {
    CredentialsSchema,
    Credentials as CredentialsCollection,
} from '../../../api/credentials';
import { wrapMeteorCallback } from '../utils/Errors';
import ChangesSaved from '../utils/ChangesSaved';
import SaveButton from '../utils/SaveButton';
import AceField from '../utils/AceField';

class Credentials extends React.Component {
    constructor(props) {
        super(props);
        this.state = { saving: false, saved: false, showConfirmation: false };
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

    renderCredentials = (saving, credentials, projectId) => {
        const { saved, showConfirmation } = this.state;
        return (
            <AutoForm
                disabled={saving}
                schema={new SimpleSchema2Bridge(CredentialsSchema)}
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
                <AceField name='credentials' label='Credentials' mode='yaml' />
                <ErrorsField />
                {showConfirmation && (
                    <ChangesSaved
                        onDismiss={() => this.setState({ saved: false, showConfirmation: false })
                        }
                        content={(
                            <p>
                                Run <b>botfront restart rasa</b> from your project&apos;s
                                folder to apply changes.
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
        const { projectId, credentials, ready } = this.props;
        const { saving } = this.state;
        if (ready) return this.renderCredentials(saving, credentials, projectId);
        return this.renderLoading();
    }
}

Credentials.propTypes = {
    projectId: PropTypes.string.isRequired,
    credentials: PropTypes.object,
    ready: PropTypes.bool.isRequired,
};

Credentials.defaultProps = {
    credentials: {},
};

const CredentialsContainer = withTracker(({ projectId }) => {
    const handler = Meteor.subscribe('credentials', projectId);
    const credentials = CredentialsCollection.findOne({ projectId });

    return {
        ready: handler.ready(),
        credentials,
    };
})(Credentials);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(CredentialsContainer);
