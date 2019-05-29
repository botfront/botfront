import PropTypes from 'prop-types';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import 'react-s-alert/dist/s-alert-default.css';
import { AutoForm, ErrorsField, SubmitField } from 'uniforms-semantic';
import { cloneDeep } from 'lodash';
import { CorePolicySchema, CorePolicies as CorePolicyCollection } from '../../../api/core_policies';
import AceField from '../utils/AceField';
import { wrapMeteorCallback } from '../utils/Errors';

class CorePolicy extends React.Component {
    constructor(props) {
        super(props);
        this.state = { saving: false };
    }

    onSave = (policies) => {
        this.setState({ saving: true });
        Meteor.call('policies.save', policies, wrapMeteorCallback(() => this.setState({ saving: false }), 'Core policies saved'));
    };

    renderPolicies = (saving, policies, projectId) => (
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
            <AceField name='policies' label='Core policies' fontSize={12} />
            <ErrorsField />
            <SubmitField data-cy='save-button' value='Save' className='primary' />
        </AutoForm>
    );

    renderLoading = () => <div />;

    render() {
        const { projectId, policies, ready } = this.props;
        const { saving } = this.state;
        if (ready) return this.renderPolicies(saving, policies, projectId);
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
    projectId: state.get('projectId'),
});

export default connect(mapStateToProps)(PolicyContainer);
