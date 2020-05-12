import React from 'react';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import {
    AutoField, AutoForm, HiddenField, SubmitField,
} from 'uniforms-semantic';
import Alert from 'react-s-alert';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';

import { Button } from 'semantic-ui-react';
import { InstanceSchema } from '../../../api/instances/instances.schema';
import { Instances as InstancesCollection } from '../../../api/instances/instances.collection';
import { wrapMeteorCallback } from '../utils/Errors';
import { can } from '../../../lib/scopes';
import restartRasa from './restartRasa';


class Instances extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            webhook: {},
        };
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
        const {
            ready, instance, projectId,
        } = this.props;
        const { webhook } = this.state;
        const hasWritePermission = can('projects:w', projectId);
        if (!instance.type) instance.type = 'server';
        return (
            <>
                {ready && (
                    <AutoForm
                        schema={new SimpleSchema2Bridge(InstanceSchema)}
                        model={instance}
                        onSubmit={updatedInstance => this.onSave(updatedInstance)}
                        onValidate={this.onValidate}
                        disabled={!hasWritePermission}
                    >
                        <HiddenField name='projectId' value={projectId} />
                        <AutoField name='host' />
                        <AutoField name='token' label='Token' />
                        <br />
                        {hasWritePermission && (
                            <SubmitField
                                className='primary save-instance-info-button'
                                value='Save Changes'
                                data-cy='save-instance'
                            />
                        )}
                        {hasWritePermission
                            && webhook
                            && webhook.url
                            && <Button content='Restart rasa' onClick={(e) => { e.preventDefault(); restartRasa(projectId, webhook); }} />}
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
        webhook: {},
    };
})(Instances);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(InstancesContainer);
