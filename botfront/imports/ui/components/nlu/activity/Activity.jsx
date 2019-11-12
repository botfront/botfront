/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withRouter } from 'react-router';
import { withTracker } from 'meteor/react-meteor-data';
import { sortBy, uniq } from 'lodash';
import moment from 'moment';
import {
    Message, Segment,
} from 'semantic-ui-react';

import { connect } from 'react-redux';

import ActivityDataTable from './ActivityDataTable';
import ActivityActions from './ActivityActions';
import { ActivityCollection } from '../../../../api/activity';
import { NLUModels } from '../../../../api/nlu_model/nlu_model.collection';
import { getPureIntents } from '../../../../api/nlu_model/nlu_model.utils';
import { wrapMeteorCallback } from '../../utils/Errors';

import PrefixDropdown from '../../common/PrefixDropdown';

class Activity extends React.Component {
    state = {
        filterFn: utterances => utterances,
        sortType: 'newest',
    };

    batchAdd = () => {
        const { modelId } = this.props;
        Meteor.call('activity.addValidatedToTraining', modelId, wrapMeteorCallback());
    };

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

    render = () => {
        const {
            model: { _id: modelId },
            utterances,
            entities,
            intents,
            projectId,
            outDatedUtteranceIds,
            numValidated,
        } = this.props;

        const { filterFn, sortType } = this.state;
        const filteredExamples = filterFn(utterances);
        return utterances && utterances.length > 0 ? (
            <>
                <Segment.Group className='new-utterances-topbar' horizontal>
                    <Segment className='new-utterances-topbar-section' tertiary compact floated='left'>
                        <ActivityActions
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
                    <Segment className='new-utterances-topbar-section' tertiary compact floated='right'>
                        <PrefixDropdown
                            selection={sortType}
                            updateSelection={(option) => {
                                this.setState({ sortType: option.value });
                            }}
                            options={[
                                { value: 'newest', text: 'Newest' },
                                { value: 'oldest', text: 'Oldest' },
                            ]}
                            prefix='Sort by'
                        />
                    </Segment>
                </Segment.Group>
                
                <br />
                <ActivityDataTable
                    utterances={utterances}
                    entities={entities}
                    intents={intents}
                    projectId={projectId}
                    outDatedUtteranceIds={outDatedUtteranceIds}
                    modelId={modelId}
                    sortBy={sortType}
                />
            </>
        ) : (
            <Message success icon='check' header='Congratulations!' content='You are up to date' />
        );
    };
}

Activity.propTypes = {
    model: PropTypes.object.isRequired,
    utterances: PropTypes.array.isRequired,
    entities: PropTypes.array.isRequired,
    intents: PropTypes.array.isRequired,
    linkRender: PropTypes.func.isRequired,
    outDatedUtteranceIds: PropTypes.array.isRequired,
};

Activity.defaultProps = {
};

const ActivityContainer = withTracker((props) => {
    const {
        modelId, entities, intents, project,
    } = props;

    const isUtteranceOutdated = ({ training: { endTime } = {} }, { updatedAt }) => moment(updatedAt).isBefore(moment(endTime));
    const getOutdatedUtterances = (utterances, projectData) => utterances.filter(u => isUtteranceOutdated(projectData, u));

    const activityHandler = Meteor.subscribe('activity', modelId);
    const model = NLUModels.findOne({ _id: modelId }, { fields: { 'training_data.common_examples': 1, training: 1, language: 1 } });
    const trainingExamples = model && model.training_data && (model.training_data.common_examples || []);
    const pureIntents = getPureIntents(trainingExamples);
    const utterances = ActivityCollection.find({ modelId }, { sort: { createdAt: 1 } }).fetch();
    const outDatedUtteranceIds = getOutdatedUtterances(utterances, project).map(u => u._id);

    let localIntents = [];
    let localEntities = []; // eslint-disable-line
    let numValidated = 0;
    if (utterances) {
        localIntents = uniq(
            utterances
                .filter(e => !!e.intent)
                .map((e) => {
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

                    return e.intent.name || e.intent;
                }),
        );
    }

    const ready = activityHandler.ready() && model && model._id;
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
    projectId: state.settings.get('projectId'),
});

const ActivityContainerRouter = withRouter(ActivityContainer);

export default connect(mapStateToProps)(ActivityContainerRouter);
