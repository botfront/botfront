/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { browserHistory, withRouter } from 'react-router';
import { withTracker } from 'meteor/react-meteor-data';
import { sortBy, uniq } from 'lodash';
import {
    Tab, Message, Segment,
} from 'semantic-ui-react';

import { connect } from 'react-redux';
import ActivityInsertions from './ActivityInsertions';
import ActivityDataTable from './ActivityDataTable';
import OutOfScope from './OutOfScope';
import ActivityActions from './ActivityActions';
import { Loading } from '../../utils/Utils';
import { ActivityCollection } from '../../../../api/activity';
import { NLUModels } from '../../../../api/nlu_model/nlu_model.collection';
import { getAllSmartTips } from '../../../../lib/smart_tips';
import { wrapMeteorCallback } from '../../utils/Errors';
import ConversationBrowser from '../../conversations/ConversationsBrowser';
import { updateIncomingPath } from '../../incoming/incoming.utils';
import PrefixDropdown from '../../common/PrefixDropdown';

class Activity extends React.Component {
    // eslint-disable-next-line react/sort-comp
    getDefaultState = () => ({
        filterFn: utterances => utterances,
        activeTabIndex: undefined,
        sortType: 'newest',
    });

    state = this.getDefaultState();

    createMenuItem = (name, index, tag = '', dataCy = null) => {
        const { router } = this.props;
        const regexp = / /g;
        const urlId = name.toLowerCase().replace(regexp, '');
        const url = updateIncomingPath({ ...router.params, tab: urlId });
        return {
            name,
            content: `${name} ${tag || ''}`,
            key: urlId,
            'data-cy': `incoming-${dataCy || urlId}-tab`,
            onClick: () => {
                if (router.params.tab === urlId) return;
                browserHistory.push({ pathname: url });
                this.setState({ activeTabIndex: index });
            },
        };
    }

    getPanes = () => {
        const {
            model,
            instance,
            project,
            replaceUrl,
            oosUtterances,
            projectId,
            intents,
            utterances,
            entities,
            environment,
        } = this.props;
        const oosPaneTitle = oosUtterances.length ? `Out of Scope (${oosUtterances.length})` : 'Out of Scope';
        return [
            { menuItem: this.createMenuItem('New Utterances', 0, `(${utterances.length})`, 'newutterances'), render: this.renderIncomingTab },
            {
                menuItem: this.createMenuItem('Conversations', 1),
                render: () => <ConversationBrowser projectId={project._id} replaceUrl={replaceUrl} environment={environment} />,
            },
            { menuItem: this.createMenuItem('Populate', 2), render: () => <ActivityInsertions model={model} instance={instance} /> },
            {
                menuItem: this.createMenuItem(oosPaneTitle, 3),
                render: () => (
                    <OutOfScope
                        model={model}
                        utterances={oosUtterances}
                        projectId={projectId}
                        intents={intents}
                        entities={entities}
                    />
                ),
            },
        ];
    }

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
                    smartTips={smartTips}
                    modelId={modelId}
                    sortBy={sortType}
                />
            </>
        ) : (
            <Message success icon='check' header='Congratulations!' content='You are up to date' />
        );
    };

    componentDidMount = () => {
        const { router } = this.props;
        const { activeTabIndex } = this.state;
        const panes = this.getPanes();
        const paneIndex = panes.findIndex(({ menuItem }) => menuItem.key === router.params.tab);
        if (activeTabIndex === undefined) this.setState({ activeTabIndex: paneIndex >= 0 ? paneIndex : 0 });
    }

    render() {
        const { ready } = this.props;
        const { activeTabIndex } = this.state;
        if (!ready) {
            return <Loading loading={!ready} />;
        }
        return (
            <Tab
                activeIndex={activeTabIndex}
                menu={{ pointing: true, secondary: true }}
                panes={this.getPanes()}
            />
        );
    }
}

Activity.propTypes = {
    model: PropTypes.object.isRequired,
    utterances: PropTypes.array.isRequired,
    oosUtterances: PropTypes.array.isRequired,
    entities: PropTypes.array.isRequired,
    intents: PropTypes.array.isRequired,
    instance: PropTypes.object.isRequired,
    linkRender: PropTypes.func.isRequired,
    smartTips: PropTypes.object.isRequired,
    numValidated: PropTypes.number.isRequired,
    outDatedUtteranceIds: PropTypes.array.isRequired,
    params: PropTypes.object,
    replaceUrl: PropTypes.func.isRequired,
    environment: PropTypes.string,
};

Activity.defaultProps = {
    params: {},
    environment: 'development',
};

const ActivityContainer = withTracker((props) => {
    const {
        modelId, entities, intents, project, environment,
    } = props;
    let envSelector;
    if (environment) envSelector = environment;
    if (environment === 'development' || !environment) {
        envSelector = { $in: ['development', null] };
    }
    const activityHandler = Meteor.subscribe('activity', modelId);
    const model = NLUModels.findOne({ _id: modelId }, { fields: { 'training_data.common_examples': 1, training: 1, language: 1 } });
   
    const utterances = ActivityCollection.find({ env: envSelector, modelId, $or: [{ ooS: { $exists: false } }, { ooS: { $eq: false } }] }, { sort: { createdAt: 1 } }).fetch();
    const oosUtterances = ActivityCollection.find({ env: envSelector, modelId, ooS: true }, { sort: { createdAt: 1 } }).fetch();
    const smartTips = getAllSmartTips(model, project, utterances);
    const outDatedUtteranceIds = Object.keys(smartTips).filter(u => smartTips[u].code === 'outdated');
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
        utterances,
        oosUtterances,
        smartTips,
        ready,
        entities: uniq(entities.concat(localEntities)),
        intents: sortBy(uniq(intents.concat(localIntents))),
        numValidated,
        outDatedUtteranceIds,
    };
})(Activity);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

const ActivityContainerRouter = withRouter(ActivityContainer);

export default connect(mapStateToProps)(ActivityContainerRouter);
