/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import matchSorter from 'match-sorter';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { sortBy, uniq } from 'lodash';
import {
    Tab,
    Button,
    Message,
} from 'semantic-ui-react';

import { connect } from 'react-redux';
import ActivityInsertions from './ActivityInsertions';
import NluDataTable from '../models/NluDataTable';
import Tip from './Tip';
import { Loading } from '../../utils/Utils';
import { ActivityCollection } from '../../../../api/activity';
import { wrapMeteorCallback } from '../../utils/Errors';
import ActivityActions from './ActivityActions';
import './style.less';
import { NLUModels } from '../../../../api/nlu_model/nlu_model.collection';
import { getAllSmartTips } from '../../../../lib/smart_tips';
import IntentViewer from '../models/IntentViewer';
import { can } from '../../../../api/roles/roles';

class Activity extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getDefaultState();
    }

    onValidateExamples = utterances => this.onExamplesEdit(utterances.map(e => ({ ...e, validated: !e.validated })));

    onChangeIntent = (examplesIds, intent, modelId) => Meteor.call('activity.onChangeIntent', examplesIds, intent, modelId, wrapMeteorCallback());

    getDefaultState = () => ({ filterFn: utterances => utterances });

    onEvaluate = () => {
        const { linkRender } = this.props;
        linkRender();
    };

    getExtraColumns() {
        const { smartTips, projectId } = this.props;
        return [
            {
                id: 'validate',
                Header: 'Validate',
                accessor: e => e,
                Cell: (props) => {
                    const {
                        value: utterance,
                        value: { validated, intent } = {},
                    } = props;
                    const { code } = smartTips[utterance._id];
                    let color = 'grey';
                    if (['intentBelowTh', 'entitiesBelowTh'].includes(code)) {
                        color = 'green';
                    } else if (['entitiesInTD'].includes(code)) {
                        color = 'yellow';
                    } else if (['aboveTh'].includes(code)) {
                        color = 'red';
                    }
                    const size = 'mini';
                    const text = <strong>{validated ? 'Validated' : 'Validate'}</strong>;
                    return (
                        <div>
                            {this.renderDeleteTip(utterance, color, smartTips) }
                            {!!validated ? (
                                can('nlu-data:w', projectId) && <Button size={size} onClick={() => this.onValidateExamples([utterance])} color='green' icon='check' data-cy='validate-button' />
                            ) : (can('nlu-data:w', projectId) && (
                                <Button
                                    basic
                                    size={size}
                                    disabled={!intent || smartTips[utterance._id].code === 'outdated'}
                                    onClick={() => this.onValidateExamples([utterance])}
                                    color={color}
                                    content={text}
                                    data-cy='validate-button'
                                />)
                            )}
                        </div>
                    );
                },
                filterable: false,
                width: 120,
                className: 'right',
            },
        ];
    }

    getIntentColumns() {
        const {
            model: {
                _id: modelId,
            },
            project: {
                training: { endTime } = {},
            },
            smartTips,
            projectId,
        } = this.props;
        return [{
            id: 'confidence',
            Header: '%',
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
                const isOutdated = smartTips[_id].code === 'outdated';
                
                return (
                    <div>
                        { isOutdated && endTime && (
                            <Tip
                                title='Confidence outdated'
                                iconName='sync'
                                iconSize='small'
                                description={(
                                    <div><br />
                                        The model was trained since this utterance was logged.
                                        <br />
                                        <br />
                                        {
                                            this.hasDataReadPermission() && (
                                                <Button
                                                    icon='sync'
                                                    color='green'
                                                    content='Re-interpret outdated utterances'
                                                    onClick={() => this.reInterpretUtterances(smartTips)}
                                                    data-cy='re-interpret-button'
                                                />)
                                        }
                                    </div>)
                                }
                            />
                        )}
                        { !isOutdated && <div className='confidence-text'>{showValue ? `${Math.floor(confidence * 100)}%` : ''}</div> }
                    </div>
                );
            },
            sortMethod: ({ confidence: conf1 }, { confidence: conf2 }) => {
                if (conf2 > conf1) {
                    return 1;
                } if (conf2 < conf1) {
                    return -1;
                }
                return 0;
            },
            width: 40,
            filterable: false,
            className: 'right',
        }, {
            accessor: e => e,
            Header: 'Intent',
            id: 'intent',
            width: 150,
            filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ['intent'] }),
            Cell: (props) => {
                const example = props.value;
                const { intents } = this.props;
                const onUpdateText = newExample => this.onChangeIntent([newExample._id], newExample.intent, modelId);

                return (
                    <IntentViewer
                        intents={intents.map(intent => ({ value: intent, text: intent }))}
                        example={example}
                        intent={example.intent ? example.intent : ''}
                        onSave={onUpdateText}
                        projectId={projectId}
                    />
                );
            },
            filterAll: true,
        }];
    }

    hasDataWritePermission = () => {
        const { projectId } = this.props;
        const hasPermission = can('nlu-data:w', projectId);
        return hasPermission;
    }

    hasDataReadPermission = () => {
        const { projectId } = this.props;
        const hasPermission = can('nlu-data:r', projectId);
        return hasPermission;
    }

    reInterpretUtterances = (smartTips) => {
        const {
            projectId, model: { _id: modelId },
        } = this.props;
        const outdated = smartTips.keys().map(u => smartTips[u].code === 'outdated');
        Meteor.call('activity.reinterpret', projectId, modelId, outdated, wrapMeteorCallback());
    }

    renderDeleteTip = (utterance) => {
        const { color, smartTips } = this.props;
        const { code, message } = smartTips[utterance._id];
        // eslint-disable-next-line react/jsx-one-expression-per-line
        const content = (
            <div>
                <br />
                { message }
                <br />
                <br />
                <Button
                    icon='trash'
                    color='green'
                    content='Delete utterances like this'
                    onClick={this.onDeleteHighConfidence}
                />
            </div>
        );
        return (
            <Tip
                iconName='lightbulb'
                iconColor={color}
                title='Delete this utterance'
                description={content}
                flowing
                hoverable
            />
        );
    }
    
    addToTrainingData = () => {
        const { model: { _id: modelId } } = this.props;
        Meteor.call('activity.addValidatedToTraining', modelId, wrapMeteorCallback());
    };

    onDeleteExamples = (modelId, itemIds) => {
        Meteor.call('activity.deleteExamples', modelId, itemIds, wrapMeteorCallback());
    };

    onExamplesEdit = (utterances, callback) => {
        Meteor.call('activity.updateExamples', utterances, wrapMeteorCallback(callback));
        // need to update outdated utterances here
    };

    onDeleteHighConfidence = () => {
        const { model: { _id: modelId }, smartTips } = this.props;
        const highConf = smartTips.keys().map(u => ['intentBelowTh', 'entitiesBelowTh'].includes(smartTips[u].code));
        Meteor.call('activity.deleteExamples', modelId, highConf, wrapMeteorCallback());
    }

    primaryRender = () => {
        const {
            model: { _id: modelId },
            utterances,
            entities,
            intents,
            numValidated,
            projectId,
        } = this.props;

        const { filterFn } = this.state;
        const filteredExamples = filterFn(utterances);
        const noExamples = (
            <Message success icon='check' header='Congratulations!' content='You are up to date' />
        );

        return utterances && utterances.length > 0 ? (
            <div>
                <ActivityActions
                    intents={intents}
                    onEvaluate={this.onEvaluate}
                    onValidate={() => this.onValidateExamples(filteredExamples)}
                    onDelete={() => this.onDeleteExamples(modelId, filteredExamples.map(e => e._id))}
                    onAddToTraining={this.addToTrainingData}
                    onSetIntent={intent => this.onChangeIntent(filteredExamples.map(e => e._id), intent, modelId)}
                    onDone={() => this.setState(this.getDefaultState())}
                    numValidated={numValidated}
                    // eslint-disable-next-line no-shadow
                    onFilterChange={filterFn => this.setState({ filterFn })}
                    projectId={projectId}
                />
                
                <br />
                <NluDataTable
                    examples={filteredExamples}
                    entities={entities}
                    intents={intents}
                    extraColumns={can('nlu-data:w', projectId) && this.getExtraColumns()}
                    intentColumns={this.getIntentColumns()}
                    showLabels
                    hideHeader
                    onDeleteExample={exampleId => this.onDeleteExamples(modelId, [exampleId])}
                    onEditExample={(example, callback) => this.onExamplesEdit([example], callback)}
                    easyEdit
                    projectId={projectId}
                />
            </div>
        ) : (
            noExamples
        );
    }

    getActivityPanes = () => {
        const { model, instance } = this.props;
        const panes = [];
        panes.push({ menuItem: 'New Utterances', render: this.primaryRender });
        if (this.hasDataWritePermission()) {
            panes.push({ menuItem: 'Populate', render: () => <ActivityInsertions model={model} instance={instance} /> });
        }
        return panes;
    }
    
    render() {
        const { ready } = this.props;
        return (
            <Loading loading={!ready}>
                <Tab
                    menu={{ pointing: true, secondary: true }}
                    panes={this.getActivityPanes()}
                />
            </Loading>
        );
    }
}

Activity.propTypes = {
    model: PropTypes.object.isRequired,
    utterances: PropTypes.array.isRequired,
    entities: PropTypes.array.isRequired,
    intents: PropTypes.array.isRequired,
    instance: PropTypes.object.isRequired,
    numValidated: PropTypes.number,
    linkRender: PropTypes.func,
    smartTips: PropTypes.object.isRequired,
};

Activity.defaultProps = {
    numValidated: 0,
    linkRender: () => {},
};


const ActivityContainer = withTracker((props) => {
    const {
        modelId,
        entities,
        intents,
        project,
    } = props;

    const activityHandler = Meteor.subscribe('activity', modelId);
    const ready = activityHandler.ready();
    const model = NLUModels.findOne({ _id: modelId }, { fields: { 'training_data.common_examples': 1, training: 1, language: 1 } });

    const utterances = ActivityCollection.find({ modelId }, { sort: { createdAt: 1 } }).fetch();
    const smartTips = getAllSmartTips(model, project, utterances, 0.87);
    let localIntents = [];
    let localEntities = []; // eslint-disable-line
    let numValidated = 0;
    if (utterances) {
        localIntents = uniq(utterances.filter(e => !!e.intent).map((e) => {
            if (e.entities) {
                e.entities.forEach((ent) => {
                    if (localEntities.indexOf(ent.entity) === -1) {
                        localEntities.push(ent.entity);
                    }
                });
            }

            if (e.validated) {
                numValidated += 1;
            }

            return (e.intent.name || e.intent);
        }));
    }

    return {
        model,
        utterances,
        smartTips,
        ready,
        entities: uniq(entities.concat(localEntities)),
        intents: sortBy(uniq(intents.concat(localIntents))),
        numValidated,
    };
})(Activity);

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

export default connect(
    mapStateToProps,
)(ActivityContainer);
