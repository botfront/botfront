import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Input } from 'semantic-ui-react';
import LookupTable from './LookupTable';
import { wrapMeteorCallback } from '../utils/Errors';
import TextInput from '../utils/TextInput';
import InlineSearch from '../utils/InlineSearch';
import { can } from '../../../lib/scopes';

function ModeEdit({ gazette, onEdit }) {
    function onUpdateText(value, callback) {
        gazette.mode = value;
        onEdit(gazette, callback);
    }

    const data = ['ratio', 'partial_ratio', 'token_sort_ratio', 'token_set_ratio'];

    return (
        <InlineSearch text={gazette.mode} data={data} onUpdateText={onUpdateText} />
    );
}

class MinScoreEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.gazette.min_score,
        }
    }

    onDone() {
        let copy = this.props.gazette.min_score;

        this.props.gazette.min_score = this.state.value;
        this.props.onEdit(this.props.gazette, (error) => {
            if (error) {
                this.props.gazette.min_score = copy;
                this.setState({value: copy})
            }
        });
    }

    handleTextChange(value) {
        this.setState({ value: parseInt(value) });
    }

    render() {
        return (
            <TextInput
                text={this.state.value.toString(10)}
                onBlur={this.onDone.bind(this)}
                onTextChange={this.handleTextChange.bind(this)}
            />
        );
    }
}

class GazetteEditor extends React.Component {
    onItemChanged = (gazette, callback) => {
        Meteor.call('nlu.upsertEntityGazette', this.props.model._id, gazette, wrapMeteorCallback(callback));
    };

    onItemDeleted = (gazette, callback) => {
        Meteor.call('nlu.deleteEntityGazette', this.props.model._id, gazette._id, wrapMeteorCallback(callback));
    };

    render() {
        const { projectId} = this.props;
        return (
            <LookupTable
                data={this.props.model.training_data.fuzzy_gazette}
                header='Gazette'
                listAttribute='gazette'
                extraColumns={this.extraColumns()}
                onItemChanged={this.onItemChanged}
                onItemDeleted={this.onItemDeleted}
                valuePlaceholder='entity name'
                listPlaceholder='match1, match2, ...'
                projectId={projectId}
            />
        );
    }

    extraColumns() {
        const { projectId } = this.props;
        return [
            {
                id: 'mode',
                accessor: e => e,
                Header: 'Mode',
                Cell: props => {
                    if (can('nlu-data:w', projectId)) {
                        return (
                            <div>
                                <ModeEdit gazette={props.value} onEdit={this.onItemChanged} />
                            </div>
                        );
                    }
                    return <span>{props.value.mode}</span>
                },
                width: 130,
                filterable: false,
            },
            {
                id: 'min_score',
                accessor: e => e,
                Header: 'Min Score',
                Cell: (props) => {
                    if (can('nlu-data:w', projectId)) {
                        return <MinScoreEdit gazette={props.value} onEdit={this.onItemChanged} />;
                    }
                    return <span>{props.value.min_score}</span>;
                },
                width: 100,
                filterable: false,
                className: 'right',
            },
        ];
    }
}

GazetteEditor.propTypes = {
    model: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
};

export default GazetteEditorContainer = withTracker((props) => {
    return {
        model: props.model,
    };
})(GazetteEditor);
