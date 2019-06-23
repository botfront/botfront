/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import matchSorter from 'match-sorter';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { sortBy, uniq } from 'lodash';
import moment from 'moment';
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
import { getPureIntents } from '../../../../api/nlu_model/nlu_model.utils';
import IntentViewer from '../models/IntentViewer';

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
        const { outDatedUtteranceIds } = this.props;
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
                    const colour = 'green';
                    const size = 'mini';
                    const text = <strong>{validated ? 'Validated' : 'Validate'}</strong>;
                    return (
                        <div>
                            {!!validated ? (
                                <Button size={size} onClick={() => this.onValidateExamples([utterance])} color='green' icon='check' />
                            ) : (
                                <Button
                                    basic
                                    size={size}
                                    disabled={!intent || outDatedUtteranceIds.includes(utterance._id)}
                                    onClick={() => this.onValidateExamples([utterance])}
                                    color={colour}
                                    content={text}
                                />
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
            outDatedUtteranceIds,
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
                const showValue = typeof intent === 'string';
                const confidenceValue = typeof confidence === 'number' ? confidence : 1;
                const outDated = outDatedUtteranceIds.includes(_id);
                
                return (
                    <div>
                        { outDated && endTime && (
                            <Tip
                                title='Confidence outdated'
                                iconName='sync'
                                iconSize='small'
                                description={(
                                    <div><br />
                                        The model was trained since this utterance was logged.
                                        <br />
                                        <br />
                                        <Button
                                            icon='sync'
                                            color='green'
                                            content={`Re-interpret ${Math.min(outDatedUtteranceIds.length, 20)} utterances like this`}
                                            onClick={() => this.reInterpretUtterances(outDatedUtteranceIds.slice(0, 20))}
                                        />
                                    </div>)
                                }
                            />
                        )}
                        { !outDated && <div className='confidence-text'>{showValue ? `${Math.floor(confidenceValue * 100)}%` : ''}</div> }
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
                    />
                );
            },
            filterAll: true,
        }];
    }

    reInterpretUtterances = (outDatedUtteranceIds) => {
        const {
            projectId, model: { _id: modelId },
        } = this.props;
        Meteor.call('activity.reinterpret', projectId, modelId, outDatedUtteranceIds, wrapMeteorCallback());
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
    };

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
                />
                
                <br />
                <NluDataTable
                    examples={filteredExamples}
                    entities={entities}
                    intents={intents}
                    extraColumns={this.getExtraColumns()}
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

    render() {
        const { model, ready, instance } = this.props;

        return (
            <Loading loading={!ready}>
                <Tab
                    menu={{ pointing: true, secondary: true }}
                    panes={[
                        { menuItem: 'New Utterances', render: this.primaryRender },
                        { menuItem: 'Populate', render: () => <ActivityInsertions model={model} instance={instance} /> },
                    ]}
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
    outDatedUtteranceIds: PropTypes.array.isRequired,
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

    const isUtteranceOutdated = ({ training: { endTime } = {} }, { updatedAt }) => moment(updatedAt).isBefore(moment(endTime));
    const getOutdatedUtterances = (utterances, projectData) => utterances.filter(u => isUtteranceOutdated(projectData, u));

    const activityHandler = Meteor.subscribe('activity', modelId);
    const ready = activityHandler.ready();
    const model = NLUModels.findOne({ _id: modelId }, { fields: { 'training_data.common_examples': 1, training: 1, language: 1 } });
    const trainingExamples = model.training_data.common_examples;
    const pureIntents = getPureIntents(trainingExamples);
    const utterances = ActivityCollection.find({ modelId }, { sort: { createdAt: 1 } }).fetch();
    const outDatedUtteranceIds = getOutdatedUtterances(utterances, project).map(u => u._id);
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
        pureIntents,
        utterances,
        outDatedUtteranceIds,
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
