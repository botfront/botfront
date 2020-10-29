import { NumField, AutoForm, ErrorsField } from 'uniforms-semantic';
import { withTracker } from 'meteor/react-meteor-data';
import 'react-s-alert/dist/s-alert-default.css';
import { Popup } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';

import { CorePolicySchema, CorePolicies as CorePolicyCollection } from '../../../api/core_policies';
import { wrapMeteorCallback } from '../utils/Errors';
import ChangesSaved from '../utils/ChangesSaved';
import SaveButton from '../utils/SaveButton';
import AceField from '../utils/AceField';
import { Can, can } from '../../../lib/scopes';

class CorePolicy extends React.Component {
    constructor(props) {
        super(props);
        this.state = { saving: false, saved: false, showConfirmation: false };
    }

    componentWillUnmount() {
        clearTimeout(this.successTimeout);
    }

    onSave = (policies) => {
        this.setState({ saving: true, showConfirmation: false });
        clearTimeout(this.successTimeout);
        Meteor.call(
            'policies.save',
            policies,
            wrapMeteorCallback((err) => {
                if (!err) {
                    this.setState({ saved: true, showConfirmation: true });
                    this.successTimeout = setTimeout(() => {
                        this.setState({ saved: false });
                    }, 2 * 1000);
                }
                this.setState({ saving: false });
            }),
        );
    };

    renderPolicies = () => {
        const { policies, projectId } = this.props;
        const { saved, showConfirmation, saving } = this.state;
        return (
            <AutoForm
                disabled={saving}
                schema={new SimpleSchema2Bridge(CorePolicySchema)}
                model={policies}
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
                <Popup
                    trigger={(
                        <NumField
                            data-cy='augmentation-factor'
                            name='augmentationFactor'
                            label='Augmentation factor'
                            disabled={!can('stories:w', projectId)}
                            defaultF
                        />
                    )}
                    hoverable
                    content={(
                        <>
                            <a
                                href='https://rasa.com/docs/rasa/policies/#data-augmentation'
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                Click here
                            </a>
                            <span> for more information on this setting (if left empty, this will default to 20)</span>
                        </>
                    )}
                />
                <AceField data-cy='core-policies-yaml' name='policies' mode='yaml' label={null} readOnly={!can('stories:w', projectId)} />
                <ErrorsField />
                {showConfirmation && (
                    <ChangesSaved
                        onDismiss={() => this.setState({ saved: false, showConfirmation: false })}
                        content={(
                            <p>
                                You need to retrain your model
                            </p>
                        )}
                    />
                )}
                <Can I='stories:w' projectId={projectId}>
                    <SaveButton saved={saved} saving={saving} />
                </Can>
            </AutoForm>
        );
    };

    renderLoading = () => <div />;

    render() {
        const { ready } = this.props;
        if (ready) return this.renderPolicies();
        return this.renderLoading();
    }
}

CorePolicy.propTypes = {
    projectId: PropTypes.string.isRequired,
    policies: PropTypes.object,
    ready: PropTypes.bool.isRequired,
};

CorePolicy.defaultProps = {
    policies: {},
};

const PolicyContainer = withTracker(({ projectId }) => {
    const handler = Meteor.subscribe('policies', projectId);
    const policies = CorePolicyCollection.findOne({ projectId });

    return {
        ready: handler.ready(),
        policies,
    };
})(CorePolicy);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(PolicyContainer);
