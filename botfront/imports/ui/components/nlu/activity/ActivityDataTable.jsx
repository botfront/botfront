import React from 'react';
import PropTypes from 'prop-types';
import {
    Tab, Button, Label, Icon, Popup,
} from 'semantic-ui-react';
import ReactTable from 'react-table';
import NLUExampleText from '../../example_editor/NLUExampleText';
import IntentViewer from '../models/IntentViewer';
import 'react-select/dist/react-select.css';
import { wrapMeteorCallback } from '../../utils/Errors';
import { can } from '../../../../api/roles/roles';
import SmartTip from './SmartTip';
import TrashBin from '../common/TrashBin';

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
        const { outDatedUtteranceIds, smartTips } = this.props;
        const deleteable = Object.keys(smartTips).filter(u => ['aboveTh'].includes(smartTips[u].code));
        return {
            id: 'actions',
            Header: 'Actions',
            sortable: false,
            accessor: e => e,
            Cell: ({ value: utterance, value: { validated, intent } = {} }) => {
                const size = 'mini';
                const isOutdated = outDatedUtteranceIds.includes(utterance._id);
                const ooS = !intent;
                const { code, tip, message } = smartTips[utterance._id];
                let action;
                if (isOutdated) {
                    action = <Button size={size} onClick={() => this.onReinterpret(utterance)} basic icon='redo' />;
                } else if (validated) {
                    action = <Button size={size} onClick={() => this.onValidate(utterance)} color='green' icon='check' />;
                } else if (code === 'aboveTh') {
                    action = (
                        <SmartTip
                            tip={tip}
                            message={message}
                            mainAction={this.renderDeleteAllButton(deleteable)}
                            otherActions={[
                                this.renderValidateButton(utterance),
                                deleteable.length > 1 && this.renderDeleteButton(utterance),
                            ]}
                            button={(
                                <Button size={size} icon='trash' color='teal' basic />
                            )}
                        />
                    );
                } else if (code === 'entitiesInTD') {
                    action = (
                        <SmartTip
                            tip={tip}
                            message={message}
                            mainAction={this.renderDeleteButton(utterance)}
                            otherActions={[
                                this.renderValidateButton(utterance),
                            ]}
                            button={(
                                <Button size={size} icon='info' color='yellow' />
                            )}
                        />
                    );
                } else if (!validated) {
                    action = (
                        <Popup
                            size='mini'
                            inverted
                            content='Mark this utterance valid'
                            trigger={(
                                <Button
                                    basic
                                    size={size}
                                    disabled={ooS}
                                    onClick={() => this.onValidate(utterance)}
                                    color='green'
                                    icon='check'
                                />
                            )}
                        />
                    );
                }

                return (
                    <div>
                        {action}
                        { !['aboveTh'].includes(code) && (
                            <TrashBin
                                onClick={() => this.onDelete(utterance)}
                            />
                        )}
                    </div>
                );
            },
            width: 80,
            className: 'right',
            style: { textAlign: 'left' },
        };
    }

    getConfidenceColumn() {
        const { outDatedUtteranceIds } = this.props;
        return {
            id: 'confidence',
            Header: '%',
            sortable: false,
            accessor: ({
                confidence, intent, _id, updatedAt,
            }) => ({
                confidence,
                intent,
                _id,
                updatedAt,
            }),
            Cell: ({ value: { confidence, intent, _id } }) => {
                const showValue = typeof intent === 'string' && typeof confidence === 'number' && confidence > 0;
                const isOutdated = outDatedUtteranceIds.includes(_id);

                return <div>{!isOutdated && <div className='confidence-text'>{showValue ? `${Math.floor(confidence * 100)}%` : ''}</div>}</div>;
            },
            width: 40,
            className: 'right',
        };
    }

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
                const { intents, outDatedUtteranceIds } = this.props;
                const onUpdateText = newExample => this.onChangeIntent([newExample._id], newExample.intent, modelId);
                const isOutdated = outDatedUtteranceIds.includes(example._id);
                
                return isOutdated
                    ? (
                        <Label color='grey' basic>
                            {example.intent || '-'}
                        </Label>
                    )
                    : (
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
        const { entities, outDatedUtteranceIds, projectId } = this.props;
        return {
            id: 'example',
            accessor: e => e,
            Header: 'Example',
            sortable: false,
            Cell: (props) => {
                const isOutdated = outDatedUtteranceIds.includes(props.value._id);
                return (
                    <NLUExampleText
                        example={props.value}
                        entities={entities}
                        showLabels
                        onSave={this.onEntityEdit}
                        editable={!isOutdated}
                        disablePopup={isOutdated}
                        projectId={projectId}
                    />
                );
            },
            style: { overflow: 'visible' },
        };
    }

    getColumns() {
        const { projectId } = this.props;
        return [
            this.getConfidenceColumn(),
            this.getIntentColumn(),
            can('nlu-data:w', projectId) && this.getExampleColumn(),
            this.getValidationColumn(),
        ];
    }

    renderDeleteAllButton = (utterances) => {
        const { modelId } = this.props;
        return mainAction => (
            <Button
                className='icon'
                color='teal'
                size={mainAction ? 'small' : 'mini'}
                icon
                fluid={mainAction}
                labelPosition='left'
                onClick={() => Meteor.call('activity.deleteExamples', modelId, utterances, wrapMeteorCallback())}
            >
                <Icon name='trash' />
                {utterances.length === 1
                    ? 'Delete this utterance'
                    : `Delete ${utterances.length} utterances like this`
                }
            </Button>
        );
    };

    renderDeleteButton = u => mainAction => (
        <Button
            className='icon'
            color={mainAction ? 'teal' : 'grey'}
            size={mainAction ? 'small' : 'mini'}
            icon
            fluid={mainAction}
            basic={!mainAction && true}
            labelPosition='left'
            onClick={() => this.onDelete(u)}
            key={`${u._id}-delete`}
        >
            <Icon name='trash' /> {mainAction ? 'Delete this utterance' : 'Delete this one only'}
        </Button>
    );

    renderValidateButton = u => mainAction => (
        <Button
            color='orange'
            size={mainAction ? 'small' : 'mini'}
            basic
            fluid={mainAction}
            content='Validate anyway'
            onClick={() => this.onValidate(u)}
            key={`${u._id}-validate`}
        />
    );

    onValidate = u => this.onExamplesEdit([{ ...u, validated: !u.validated }]);

    onChangeIntent = (examplesIds, intent, modelId) => Meteor.call('activity.onChangeIntent', examplesIds, intent, modelId, wrapMeteorCallback());

    onExamplesEdit = (utterances, callback) => {
        Meteor.call('activity.updateExamples', utterances, wrapMeteorCallback(callback));
    };

    onEntityEdit = (u, callback) => {
        this.onExamplesEdit([{ ...u, entities: u.entities.map(entity => ({ ...entity, confidence: 0 })) }], callback);
    }

    onReinterpret = (u) => {
        const { projectId, modelId } = this.props;
        Meteor.call('activity.reinterpret', projectId, modelId, [u], wrapMeteorCallback());
    };

    onDelete = (u) => {
        const { modelId } = this.props;
        Meteor.call('activity.deleteExamples', modelId, [u._id], wrapMeteorCallback());
    };

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
                        getTheadThProps={(state, row, column) => {
                            const style = column.id === 'confidence' ? { textAlign: 'right' } : { textAlign: 'left' };
                            return ({
                                style: {
                                    borderRight: 'none',
                                    fontWeight: 800,
                                    paddingBottom: '10px',
                                    ...style,
                                },
                            });
                        }}
                        className=''
                    />
                </div>
            </Tab.Pane>
        );
    }
}

ActivityDataTable.propTypes = {
    utterances: PropTypes.array.isRequired,
    intents: PropTypes.array.isRequired,
    entities: PropTypes.array.isRequired,
    projectId: PropTypes.string.isRequired,
    outDatedUtteranceIds: PropTypes.array.isRequired,
    smartTips: PropTypes.object.isRequired,
    modelId: PropTypes.string.isRequired,
};
