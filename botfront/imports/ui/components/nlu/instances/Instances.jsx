import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import {
    Button, Card, Confirm, Label,
} from 'semantic-ui-react';
import {
    AutoField, AutoForm, ErrorsField, HiddenField, SubmitField,
} from 'uniforms-semantic';
import Alert from 'react-s-alert';

import { Instances as InstancesCollection } from '../../../../api/instances/instances.collection';
import SelectField from '../../form_fields/SelectField';
import { can } from '../../../../lib/scopes';

const NONE = -2;
const NEW_INSTANCE = -1;

class Instances extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmOpen: false,
            editing: NONE,
        };
    }

    createOrUpdateInstance = (instance) => {
        const method = instance._id ? 'instance.update' : 'instance.insert';
        Meteor.call(method, instance, (err) => {
            this.setState({ editing: NONE, confirmOpen: false });
            if (err) Alert.error(`Error: ${err.reason}`, { position: 'top-right', timeout: 'none' });
        });
    };

    deleteInstance = (instance) => {
        const { projectId } = this.props;
        Meteor.call('instance.remove', instance._id, projectId, (err) => {
            this.setState({ editing: NONE, confirmOpen: false });
            if (err) Alert.error(`Error: ${err.reason}`, { position: 'top-right', timeout: 'none' });
        });
    };

    getType = instance => (instance.type ? instance.type.map(type => <Label content={type} />) : <></>);

    renderReady = (instances, editing) => instances.map((instance, index) => (editing === index ? this.renderAddOrEditInstance(instance, index) : this.renderInstance(instance, index)));
    
    renderInstance = (instance, index) => {
        const { confirmOpen } = this.state;
        return (
            <Card key={index}>
                <Confirm
                    open={confirmOpen}
                    header={`Delete instance ${instance.name}?`}
                    content='This cannot be undone!'
                    onCancel={() => this.setState({ editing: NONE, confirmOpen: false })}
                    onConfirm={() => this.deleteInstance(instance)}
                />
                <Card.Content>
                    <Card.Header>{instance.name}</Card.Header>
                    <Card.Meta>{this.getType(instance)}</Card.Meta>
                    <Card.Description>{instance.host}</Card.Description>
                </Card.Content>
                <Card.Content extra>
                    <Button.Group basic floated='right'>
                        <Button primary onClick={() => this.setState({ editing: index })} icon='edit' data-cy='edit-instance' />
                        <Button color='red' onClick={() => this.setState({ confirmOpen: true })} icon='trash' />
                    </Button.Group>
                </Card.Content>
            </Card>
        );
    };

    onValidate = (model, error, callback) => {
        InstancesCollection.simpleSchema().clean(model);
        console.log(model);
        callback();
    };

    renderAddOrEditInstance(instance) {
        const { projectId } = this.props;
        return (
            <Card raised key={instance._id}>
                <Card.Content extra>
                    <Label attached='top right' as='a' icon='close' onClick={() => this.setState({ editing: NONE })} />
                    <AutoForm
                        schema={InstancesCollection.simpleSchema()}
                        model={instance}
                        onSubmit={i => this.createOrUpdateInstance(i)}
                        disabled={instance.adminOnly && !can('global-admin')}
                        onValidate={this.onValidate}
                    >
                        <HiddenField name='projectId' value={projectId} />
                        <AutoField name='name' label='Instance name' />
                        <SelectField name='type' label='Type' data-cy='type-selector' />
                        <AutoField name='host' />
                        {can('global-admin') && <AutoField name='adminOnly' />}
                        <AutoField name='token' label='Token' />

                        <ErrorsField />
                        {(can('global-admin') || !instance.adminOnly) && (
                            <>
                                <SubmitField value='Save instance' className='primary' data-cy='save-instance' />
                            </>
                        )}
                    </AutoForm>
                </Card.Content>
            </Card>
        );
    }

    renderLoading = () => <div />;

    renderInstances(editing, instances) {
        return instances.map((instance, index) => (editing === index ? this.renderAddOrEditInstance(instance, index) : this.renderInstance(instance, index)));
    }

    renderReady = (editing, instances) => (
        <Card.Group>
            {this.renderInstances(editing, instances)}
            {editing === NEW_INSTANCE && this.renderAddOrEditInstance({})}

            {editing === NONE && (
                <Card key='new-instance'>
                    <Card.Content />
                    <Card.Content extra>
                        <Button fluid onClick={() => this.setState({ editing: NEW_INSTANCE })} primary disabled={editing !== NONE} icon='add' content='New instance' labelPosition='left' />
                    </Card.Content>
                </Card>
            )}
        </Card.Group>
    );

    render() {
        const { instances, ready } = this.props;
        const { editing } = this.state;
        return (
            <>
                {ready && this.renderReady(editing, instances)}
                {!ready && this.renderLoading()}
            </>
        );
    }
}

Instances.propTypes = {
    instances: PropTypes.array.isRequired,
    projectId: PropTypes.string.isRequired,
    ready: PropTypes.bool.isRequired,
};

const InstancesContainer = withTracker((props) => {
    const { projectId } = props;
    const handler = Meteor.subscribe('nlu_instances', projectId);
    const instances = InstancesCollection.find({ projectId }).fetch();
    return {
        ready: handler.ready(),
        instances,
    };
})(Instances);

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

export default connect(mapStateToProps)(InstancesContainer);
