import { Segment } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import {
    AutoForm, AutoField, ErrorsField, SubmitField, HiddenField,
} from 'uniforms-semantic';
import ReactJson from 'react-json-view';
import { DeploymentSchema } from '../../../../api/deployment/deployment.schema';
import { Deployments as DeploymentsCollection } from '../../../../api/deployment/deployment.collection';
import { wrapMeteorCallback } from '../../utils/Errors';

class Deployment extends React.Component {
    constructor(props) {
        super(props);
        this.state = { saving: false };
    }

    onSave = (deployment) => {
        this.setState({ saving: true });
        const { projectId } = this.props;
        const deploymentWithProjectId = Object.assign(deployment, { projectId });
        Meteor.call('deployments.save', deploymentWithProjectId, wrapMeteorCallback(() => this.setState({ saving: false }), 'Deployment info saved'));
    };

    renderDeployment = (saving, deployment, projectId) => (
        <>
            <AutoForm schema={DeploymentSchema} model={deployment} onSubmit={this.onSave} disabled={saving}>
                <AutoField name='deployment.namespace' />
                <AutoField name='deployment.domain' />
                <HiddenField name='projectId' value={projectId} />
                <AutoField name='deployment.config.bf_url' />
                <AutoField name='deployment.config.bf_api_key' />
                <AutoField name='deployment.config.bf_project_id' />
                <AutoField name='deployment.config.nlu_models_bucket' />
                <AutoField name='deployment.config.core_models_bucket' />
                <AutoField name='deployment.config.debug' />
                <AutoField name='deployment.images.core' />
                <AutoField name='deployment.images.nlu' />
                <AutoField name='deployment.images.actions' />
                <AutoField name='deployment.images.webchat' />
                <ErrorsField />
                <SubmitField />
            </AutoForm>
            <br />
            <ReactJson src={deployment.deployment} collapsed={1} name={false} />
        </>
    );

    renderLoading = () => <div />;

    render() {
        const { projectId, deployment, ready } = this.props;
        const { saving } = this.state;
        if (ready) return this.renderDeployment(saving, deployment, projectId);
        return this.renderLoading();
    }
}

Deployment.propTypes = {
    deployment: PropTypes.object,
    projectId: PropTypes.string.isRequired,
    ready: PropTypes.bool.isRequired,
};

Deployment.defaultProps = {
    deployment: {},
};

const DeploymentContainer = withTracker(({ projectId }) => {
    const handler = Meteor.subscribe('deployments', projectId);
    const deployment = DeploymentsCollection.findOne({ projectId });
    return {
        ready: handler.ready(),
        deployment,
    };
})(Deployment);

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

export default connect(mapStateToProps)(DeploymentContainer);
