import React from 'react';
import PropTypes from 'prop-types';
import { Tab, Button, Icon } from 'semantic-ui-react';
import ReactTable from 'react-table';
import NLUExampleText from '../../example_editor/NLUExampleText';
import IntentViewer from '../models/IntentViewer';
import 'react-select/dist/react-select.css';
import { wrapMeteorCallback } from '../../utils/Errors';

export default class ActivityDataTable extends React.Component {
    getIntentForDropdown(all) {
        const intentSelection = all ? [{ text: 'ALL', value: null }] : [];
        const { intents } = this.props;
        intents.forEach((i) => {
            intentSelection.push({
                text: i,
                value: i,
            });
        });
        return intentSelection;
    }

    getValidationColumn() {
        const { outDatedUtteranceIds } = this.props;
        return {
            id: 'actions',
            Header: 'Actions',
            sortable: false,
            accessor: e => e,
            Cell: ({
                value: utterance,
                value: { validated, intent } = {},
            }) => {
                const size = 'mini';
                const isOutdated = outDatedUtteranceIds.includes(utterance._id);
                const ooS = !intent;
                let actions;
                if (isOutdated) {
                    actions = [
                        <Button size={size} onClick={() => this.onReinterpret(utterance)} circular basic icon='redo' />,
                    ];
                } else if (!!validated) {
                    actions = [
                        <Button size={size} onClick={() => this.onValidate(utterance)} color='green' circular icon='check' />,
                    ];
                } else {
                    actions = [
                        <Button
                            basic
                            circular
                            size={size}
                            disabled={ooS}
                            onClick={() => this.onValidate(utterance)}
                            color='green'
                            icon='check'
                        />,
                    ];
                }
                return (
                    <div>
                        {actions}
                        <Button
                            circular
                            size={size}
                            icon='trash'
                            onClick={() => this.onDelete(utterance)}
                            className='viewOnHover subdued'
                        />
                    </div>
                );
            },
            width: 80,
            className: 'right',
        };
    }

    getConfidenceColumn() {
        const {
            outDatedUtteranceIds,
        } = this.props;
        return {
            id: 'confidence',
            Header: '%',
            sortable: false,
            accessor: ({
                confidence, intent, _id, updatedAt,
            }) => ({
                confidence, intent, _id, updatedAt,
            }),
            Cell: ({
                value: {
                    confidence, intent, _id,
                },
            }) => {
                const showValue = (typeof intent === 'string' && typeof confidence === 'number' && confidence > 0);
                const isOutdated = outDatedUtteranceIds.includes(_id);
                
                return (
                    <div>
                        { !isOutdated && <div className='confidence-text'>{showValue ? `${Math.floor(confidence * 100)}%` : ''}</div> }
                    </div>
                );
            },
            width: 40,
            className: 'right',
        };
    }

    getIntentColumn() {
        const {
            modelId, projectId,
        } = this.props;
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
                    />
                );
            },
        };
    }

    getExampleColumn() {
        const { entities } = this.props;
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
                    onSave={this.onEntityEdit}
                    editable
                />
            ),
            style: { overflow: 'visible' },
        };
    }

    getColumns() {
        return [
            this.getConfidenceColumn(),
            this.getIntentColumn(),
            this.getExampleColumn(),
            this.getValidationColumn(),
        ];
    }

    onValidate = u => this.onExamplesEdit([{ ...u, validated: !u.validated }]);

    onChangeIntent = (examplesIds, intent, modelId) => Meteor.call('activity.onChangeIntent', examplesIds, intent, modelId, wrapMeteorCallback());

    onExamplesEdit = (utterances, callback) => {
        Meteor.call('activity.updateExamples', utterances, wrapMeteorCallback(callback));
    }

    onEntityEdit = (utterance, callback) => {
        this.onExamplesEdit([utterance], callback);
    }

    onReinterpret = (u) => {
        const { projectId, modelId } = this.props;
        Meteor.call('activity.reinterpret', projectId, modelId, [u], wrapMeteorCallback());
    }

    onDelete = (u) => {
        const { modelId } = this.props;
        Meteor.call('activity.deleteExamples', modelId, [u._id], wrapMeteorCallback());
    }

    render() {
        const columns = this.getColumns();
        const { utterances } = this.props;
        return (
            <Tab.Pane as='div'>
                <div style={{ padding: '0px', background: '#fff' }}>
                    <ReactTable
                        data={utterances}
                        columns={columns}
                        minRows={1}
                        style={{ overflow: 'visible' }}
                        getTbodyProps={() => ({
                            style: {
                                overflow: 'visible',
                            },
                        })}
                        getTableProps={() => ({
                            style: {
                                overflow: 'visible',
                                background: '#fff',
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
                        getTheadThProps={() => ({
                            style: {
                                borderRight: 'none',
                            },
                        })}
                        className=''
                    />
                </div>
            </Tab.Pane>
        );
    }
}

ActivityDataTable.propTypes = {
    utterances: PropTypes.array,
    intents: PropTypes.array,
    entities: PropTypes.array,
    projectId: PropTypes.string.isRequired,
    outDatedUtteranceIds: PropTypes.array,
    modelId: PropTypes.string,
    linkRender: PropTypes.func,
};
