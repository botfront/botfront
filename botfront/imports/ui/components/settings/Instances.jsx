import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import {
    AutoField, AutoForm, HiddenField, SubmitField,
} from 'uniforms-semantic';
import Alert from 'react-s-alert';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';

import { InstanceSchema } from '../../../api/instances/instances.schema';

import { Instances as InstancesCollection } from '../../../api/instances/instances.collection';
import { wrapMeteorCallback } from '../utils/Errors';

class Instances extends React.Component {
    onValidate = (model, error, callback) => {
        InstancesCollection.simpleSchema().clean(model);
        callback();
    };

    onSave = (updatedInstance) => {
        Meteor.call('instance.update', updatedInstance, wrapMeteorCallback((err) => {
            if (err) Alert.error(`Error: ${err.reason}`, { position: 'top-right', timeout: 'none' });
        }, 'Changes Saved'));
    }

    render() {
        const { ready, instance, projectId } = this.props;
        return (
            <>
                {ready && (
                    <AutoForm schema={new SimpleSchema2Bridge(InstanceSchema)} model={instance} onSubmit={updatedInstance => this.onSave(updatedInstance)} onValidate={this.onValidate}>
                        <HiddenField name='projectId' value={projectId} />
                        <AutoField name='host' />
                        <AutoField name='token' label='Token' />
                        <br />
                        <SubmitField className='primary save-instance-info-button' value='Save Changes' data-cy='save-instance' />
                    </AutoForm>
                )}
            </>
        );
    }
}

Instances.propTypes = {
    instance: PropTypes.object,
    projectId: PropTypes.string.isRequired,
    ready: PropTypes.bool.isRequired,
};

Instances.defaultProps = {
    instance: {},
};

const InstancesContainer = withTracker((props) => {
    const { projectId } = props;
    const handler = Meteor.subscribe('nlu_instances', projectId);
    const instance = InstancesCollection.findOne({ projectId });
    return {
        ready: handler.ready(),
        instance,
    };
})(Instances);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(InstancesContainer);
