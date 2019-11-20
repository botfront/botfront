import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import {
    Tab, Popup, Button, Icon,
} from 'semantic-ui-react';
import { saveAs } from 'file-saver';
import ReactTable from 'react-table-v6';
// import 'react-table/react-table.css';
import { can } from '../../../../lib/scopes';
import FloatingIconButton from '../common/FloatingIconButton';
import IntentViewer from '../models/IntentViewer';
import NLUExampleText from '../../example_editor/NLUExampleText';
import { wrapMeteorCallback } from '../../utils/Errors';

class OutOfScope extends React.Component {
    getIntentColumn() {
        const { modelId, projectId } = this.props;
        return {
            accessor: e => e,
            Header: 'Intent',
            id: 'intent',
            sortable: false,
            width: 150,
            Cell: (props) => {
                const example = props.value;
                const { intents } = this.props;
                const onUpdateText = newExample => this.onChangeIntent([newExample._id], newExample.intent, modelId);
                
                return (
                    <IntentViewer
                        intents={intents.map(intent => ({ value: intent, text: intent }))}
                        example={example}
                        intent={example.intent ? example.intent : ''}
                        projectId={projectId}
                        onSave={onUpdateText}
                        enableReset
                    />
                );
            },
        };
    }

    getExampleColumn() {
        const { entities, projectId } = this.props;
        return {
            id: 'example',
            accessor: e => e,
            Header: 'Example',
            sortable: false,
            Cell: props => (
                <NLUExampleText
                    example={props.value}
                    entities={entities}
                    showLabels
                    editable
                    onSave={this.onEntityEdit}
                    projectId={projectId}
                />
            ),
            style: { overflow: 'visible' },
        };
    }

    getActionColumn() {
        return {
            id: 'actions',
            Header: 'Actions',
            sortable: false,
            accessor: e => e,
            Cell: ({ value: utterance, value: { intent: taggedIntent } = {} }) => {
                const size = 'mini';
                return (
                    <div>
                        {taggedIntent && (
                            <Popup
                                size='mini'
                                inverted
                                content='Add this utterance to training data'
                                trigger={(
                                    <Button
                                        basic
                                        size={size}
                                        onClick={() => this.onAddToTD(utterance)}
                                        color='black'
                                        icon='plus'
                                    />
                                )}
                            />
                        )}
                        <FloatingIconButton icon='trash' onClick={() => this.onDelete(utterance)} />
                    </div>
                );
            },
            width: 80,
            className: 'right',
            style: { textAlign: 'left' },
        };
    }

    getColumns() {
        const { projectId } = this.props;
        return [
            this.getIntentColumn(),
            this.getExampleColumn(),
            can('nlu-data:w', projectId) && this.getActionColumn(),
        ];
    }

    onChangeIntent = (examplesIds, intent, modelId) => Meteor.call('activity.onChangeIntent', examplesIds, intent, modelId, wrapMeteorCallback());

    onExamplesEdit = (utterances, callback) => {
        Meteor.call('activity.updateExamples', utterances, wrapMeteorCallback(callback));
    };

    onEntityEdit = (u, callback) => {
        this.onExamplesEdit([{ ...u, entities: u.entities.map(entity => ({ ...entity, confidence: 0 })) }], callback);
    };

    onDelete = (u) => {
        const { modelId } = this.props;
        Meteor.call('activity.deleteExamples', modelId, [u._id], wrapMeteorCallback());
    };

    onAddToTD = (u) => {
        const { modelId } = this.props;
        Meteor.call('activity.addToTraining', modelId, [u._id], wrapMeteorCallback());
    };

    onExport = () => {
        const { utterances } = this.props;
        const csvData = utterances.map(u => (
            `"${(u.intent || '-').replace('"', '""')}","${u.text.replace('"', '""')}",`
        )).join('\n');
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
        return saveAs(blob, 'out_of_scope.csv');
    }

    render() {
        const { utterances, projectId } = this.props;
        const headerStyle = { textAlign: 'left', fontWeight: 800, paddingBottom: '10px' };
        return (
            <Tab.Pane as='div'>
                { can('nlu-data:w', projectId) && (
                    <div style={{ paddingBottom: '15px' }}>
                        <Button onClick={this.onExport} disabled={!utterances.length}><Icon name='download' />Export</Button>
                    </div>
                )}
                <ReactTable
                    data={utterances}
                    minRows={1}
                    columns={this.getColumns()}
                    getTheadThProps={() => ({
                        style: {
                            borderRight: 'none',
                            ...headerStyle,
                        },
                    })}
                    getTdProps={() => ({
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            borderRight: 'none',
                        },
                    })}
                />
            </Tab.Pane>
        );
    }
}

OutOfScope.propTypes = {
    projectId: PropTypes.string.isRequired,
    modelId: PropTypes.string.isRequired,
    utterances: PropTypes.arrayOf(PropTypes.object).isRequired,
    intents: PropTypes.array.isRequired,
    entities: PropTypes.array.isRequired,
};

export default withTracker((props) => {
    const {
        model: { _id: modelId },
        projectId,
        intents,
        utterances: utterancesWithConfidence,
        entities,
    } = props;
    const utterances = utterancesWithConfidence.map(
        u => ({ ...u, entities: u.entities.map((e) => { delete e.confidence; return e; }) }),
    );
    return {
        projectId,
        intents,
        modelId,
        utterances,
        entities,
    };
})(OutOfScope);
