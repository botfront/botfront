import { AutoForm, ErrorsField } from 'uniforms-semantic';
import { withTracker } from 'meteor/react-meteor-data';
import 'react-s-alert/dist/s-alert-default.css';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import { CorePolicySchema, CorePolicies as CorePolicyCollection } from '../../../api/core_policies';
import { wrapMeteorCallback } from '../utils/Errors';
import ChangesSaved from '../utils/ChangesSaved';
import SaveButton from '../utils/SaveButton';
import AceField from '../utils/AceField';

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
                schema={CorePolicySchema}
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
                <AceField name='policies' fontSize={12} mode='yaml' label={null} />
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
                <SaveButton saved={saved} saving={saving} />
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
