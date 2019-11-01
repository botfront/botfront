/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { sortBy, uniq } from 'lodash';
import {
    Tab, Message, Dropdown, Segment, Button,
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
import { can } from '../../../../api/roles/roles';
import { wrapMeteorCallback } from '../../utils/Errors';
import ConversationBrowser from '../../conversations/ConversationsBrowser';

class Activity extends React.Component {
    // eslint-disable-next-line react/sort-comp
    getDefaultState = () => ({
        filterFn: utterances => utterances,
        activeTabIndex: undefined,
        sortType: 'mostRecent',
        isSortDropdownOpen: false,
    });

    state = this.getDefaultState();

    componentDidMount = () => {
        const { params } = this.props;
        const { activeTabIndex } = this.state;
        if (activeTabIndex === undefined && !params.tab) this.setState({ activeTabIndex: 0 });
    }

    createMenuItem = (name, index, dataCy = null) => {
        const {
            model, projectId, params, replaceUrl,
        } = this.props;
        const regexp = / /g;
        const urlId = name.toLowerCase().replace(regexp, '');
        const url = `/project/${projectId}/incoming/${model._id}/${urlId}`;
        return {
            content: name,
            key: `incoming-tab-${index}`,
            'data-cy': `incoming-${dataCy || urlId}-tab`,
            onClick: () => {
                // const url = `/project/${projectId}/model/${model._id}/${urlId}`;
                if (params.tab === urlId) return;
                replaceUrl({ pathname: url });
                this.setState({ activeTabIndex: index });
            },
        };
    }

    getPanes = () => {
        const {
            model,
            instance,
            project,
            params,
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
            { menuItem: this.createMenuItem(`New Utterances (${utterances.length})`, 0, 'newutterances'), render: this.renderIncomingTab },
            {
                menuItem: this.createMenuItem('Conversations', 1),
                render: () => <ConversationBrowser projectId={project._id} params={params} replaceUrl={replaceUrl} environment={environment} />,
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

    dropdownOptions = [
        { value: 'mostRecent', text: 'Newest' },
        { value: 'leastRecent', text: 'Oldest' },
    ];

    toggleSortDropdown = () => {
        const { isSortDropdownOpen } = this.state;
        this.setState({ isSortDropdownOpen: !isSortDropdownOpen });
    }

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

        const { filterFn, sortType, isSortDropdownOpen } = this.state;
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
                        <Button.Group className='sort-dropdown' basic onClick={() => { this.setState({ isSortDropdownOpen: !isSortDropdownOpen }); }}>
                            <Dropdown
                                onClick={() => { this.setState({ isSortDropdownOpen: !isSortDropdownOpen }); }}
                                open={isSortDropdownOpen}
                                floating
                                className='button icon'
                                value={sortType}
                                trigger={(
                                    <Segment className='button sort-dropdown-trigger' data-cy='sort-utterances-dropdown'>
                                        Sort by: <b>{this.dropdownOptions.find(({ value }) => value === sortType).text}</b>
                                    </Segment>
                                )}
                                options={this.dropdownOptions}
                                onChange={(e, option) => {
                                    this.setState({ sortType: option.value, isSortDropdownOpen: false });
                                }}
                            />
                        </Button.Group>
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

    getActivityPanes = () => {
        const {
            model, instance, projectId, intents, oosUtterances, entities, utterances,
        } = this.props;
        const panes = [];
        const incomingPaneTitle = utterances.length ? `Incoming (${utterances.length})` : 'Incoming';
        const oosPaneTitle = oosUtterances.length ? `Out of Scope (${oosUtterances.length})` : 'Out of Scope';
        panes.push({ menuItem: incomingPaneTitle, render: this.renderIncomingTab });
        panes.push({
            menuItem: oosPaneTitle,
            render: () => (
                <OutOfScope
                    model={model}
                    utterances={oosUtterances}
                    projectId={projectId}
                    intents={intents}
                    entities={entities}
                />
            ),
        });
        if (can('nlu-data:w', projectId)) {
            panes.push({ menuItem: 'Populate', render: () => <ActivityInsertions model={model} instance={instance} /> });
        }
        return panes;
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
        modelId, entities, intents, project,
    } = props;

    const activityHandler = Meteor.subscribe('activity', modelId);
    const model = NLUModels.findOne({ _id: modelId }, { fields: { 'training_data.common_examples': 1, training: 1, language: 1 } });

    const utterances = ActivityCollection.find({ modelId, $or: [{ ooS: { $exists: false } }, { ooS: { $eq: false } }] }, { sort: { createdAt: 1 } }).fetch();
    const oosUtterances = ActivityCollection.find({ modelId, ooS: true }, { sort: { createdAt: 1 } }).fetch();
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

export default connect(mapStateToProps)(ActivityContainer);
