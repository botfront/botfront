import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import LookupTable from './LookupTable';
import { wrapMeteorCallback } from '../utils/Errors';

class SynonymsEditor extends React.Component {
    onItemChanged = (synonym, callback) => {
        const { model } = this.props;
        Meteor.call('nlu.upsertEntitySynonym', model._id, synonym, wrapMeteorCallback(callback));
    };

    onItemDeleted = (synonym, callback) => {
        const { model } = this.props;
        Meteor.call('nlu.deleteEntitySynonym', model._id, synonym._id, wrapMeteorCallback(callback));
    };

    render() {
        const { model, projectId } = this.props;
        return (
            <LookupTable
                data={model.training_data.entity_synonyms}
                keyHeader='Value'
                keyAttribute='value'
                listHeader='Synonyms'
                listAttribute='synonyms'
                onItemChanged={this.onItemChanged}
                onItemDeleted={this.onItemDeleted}
                valuePlaceholder='entity value'
                listPlaceholder='synonym1, synonym2, ...'
                projectId={projectId}
            />
        );
    }
}

SynonymsEditor.propTypes = {
    model: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
};

export default withTracker(props => ({
    model: props.model,
}))(SynonymsEditor);
