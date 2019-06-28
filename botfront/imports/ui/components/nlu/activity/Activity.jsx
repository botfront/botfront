/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { sortBy, uniq } from 'lodash';
import { Tab, Message, Segment } from 'semantic-ui-react';

import { connect } from 'react-redux';
import ActivityInsertions from './ActivityInsertions';
import ActivityDataTable from './ActivityDataTable';
import ActivityActions from './ActivityActions';
import { Loading } from '../../utils/Utils';
import { ActivityCollection } from '../../../../api/activity';
import './style.less';
import { NLUModels } from '../../../../api/nlu_model/nlu_model.collection';
import { getAllSmartTips } from '../../../../lib/smart_tips';
import { can } from '../../../../api/roles/roles';
import { wrapMeteorCallback } from '../../utils/Errors';

class Activity extends React.Component {
    getDefaultState = () => ({ filterFn: utterances => utterances }); // eslint-disable-line react/sort-comp

    state = this.getDefaultState();

    batchAdd = () => {
        const { modelId } = this.props;
        Meteor.call('activity.addValidatedToTraining', modelId, wrapMeteorCallback());
    }

    batchReinterpret = () => {
        const { projectId, modelId, outDatedUtteranceIds } = this.props;
        Meteor.call('activity.reinterpret', projectId, modelId, outDatedUtteranceIds, wrapMeteorCallback());
    }

    batchDelete = (modelId, itemIds) => {
        Meteor.call('activity.deleteExamples', modelId, itemIds, wrapMeteorCallback());
    };

    onEvaluate = () => {
        const { linkRender } = this.props;
        linkRender();
    };

    onValidateExamples = utterances => this.onExamplesEdit(utterances.map(e => ({ ...e, validated: !e.validated })));
    
    onExamplesEdit = (utterances, callback) => {
        Meteor.call('activity.updateExamples', utterances, wrapMeteorCallback(callback));
    };

    renderIncomingTab = () => {
        const {
            model: { _id: modelId },
            utterances,
            entities,
            intents,
            projectId,
            outDatedUtteranceIds,
            smartTips,
            linkRender,
            numValidated,
        } = this.props;

        const { filterFn } = this.state;
        const filteredExamples = filterFn(utterances);

        return utterances && utterances.length > 0 ? (
            <div>
                <Segment vertical>
                    <ActivityActions
                        intents={intents}
                        onEvaluate={this.onEvaluate}
                        onDelete={() => this.batchDelete(modelId, filteredExamples.map(e => e._id))}
                        onAddToTraining={this.batchAdd}
                        onDone={() => this.setState(this.getDefaultState())}
                        onValidate={() => this.onValidateExamples(filteredExamples)}
                        numValidated={numValidated}
                        // eslint-disable-next-line no-shadow
                        onFilterChange={filterFn => this.setState({ filterFn })}
                        projectId={projectId}
                    />
                </Segment>
                <Segment vertical>
                    <ActivityDataTable
                        utterances={utterances}
                        entities={entities}
                        intents={intents}
                        projectId={projectId}
                        outDatedUtteranceIds={outDatedUtteranceIds}
                        smartTips={smartTips}
                        linkRender={linkRender}
                        modelId={modelId}
                    />
                </Segment>
            </div>
        ) : (
            <Message success icon='check' header='Congratulations!' content='You are up to date' />
        );
    }

    getActivityPanes = () => {
        const { model, instance, projectId } = this.props;
        const panes = [];
        panes.push({ menuItem: 'Incoming', render: this.renderIncomingTab });
        if (can('nlu-data:w', projectId)) {
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
    linkRender: PropTypes.func,
    smartTips: PropTypes.object.isRequired,
    numValidated: PropTypes.number,
    outDatedUtteranceIds: PropTypes.array,
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
    const smartTips = getAllSmartTips(model, project, utterances);
    const outDatedUtteranceIds = Object.keys(smartTips).filter(u => smartTips[u].code === 'outdated');
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
        outDatedUtteranceIds,
    };
})(Activity);

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

export default connect(
    mapStateToProps,
)(ActivityContainer);
