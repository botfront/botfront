/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import { browserHistory, Link } from 'react-router';
import { withTracker } from 'meteor/react-meteor-data';
import { uniq, sortBy } from 'lodash';
import {
    Label,
    Container,
    Icon,
    Menu,
    Message,
    Tab,
    Popup,
    Placeholder,
} from 'semantic-ui-react';
import 'react-select/dist/react-select.css';
import { connect } from 'react-redux';

import { NLUModels } from '../../../../api/nlu_model/nlu_model.collection';
import { isTraining, getNluModelLanguages } from '../../../../api/nlu_model/nlu_model.utils';
import { Instances } from '../../../../api/instances/instances.collection';
import NluDataTable from './NluDataTable';
import NLUPlayground from '../../example_editor/NLUPlayground';
import Evaluation from '../evaluation/Evaluation';
import ChitChat from './ChitChat';
import IntentBulkInsert from './IntentBulkInsert';
import Synonyms from '../../synonyms/Synonyms';
import Gazette from '../../synonyms/Gazette';
import NLUPipeline from './settings/NLUPipeline';
import TrainButton from '../../utils/TrainButton';
import Statistics from './Statistics';
import OutOfScope from './OutOfScope';
import DeleteModel from './DeleteModel';
import ExampleUtils from '../../utils/ExampleUtils';
import LanguageDropdown from '../../common/LanguageDropdown';
import { _appendSynonymsToText } from '../../../../lib/filterExamples';
import { wrapMeteorCallback } from '../../utils/Errors';
import API from './API';
import { GlobalSettings } from '../../../../api/globalSettings/globalSettings.collection';
import { can } from '../../../../lib/scopes';

// const API = React.lazy(() => import('./API'));
import { Projects } from '../../../../api/project/project.collection';
import { extractEntities } from './nluModel.utils';
import { setWorkingLanguage } from '../../../store/actions/actions';
import { WithRefreshOnLoad } from '../../../layouts/project';

class NLUModel extends React.Component {
    constructor(props) {
        super(props);
        const { location: { state: incomingState } } = props;

        this.state = {
            activeItem: incomingState && incomingState.isActivityLinkRender === true ? 'evaluation' : 'data',
            ...NLUModel.getDerivedStateFromProps(props),
            activityLinkRender: (incomingState && incomingState.isActivityLinkRender) || false,
        };
    }

    static getDerivedStateFromProps(props) {
        const {
            intents,
            entities,
            ready,
            instance,
        } = props;
        return {
            examples: ready ? NLUModel.getExamplesWithExtraSynonyms(props) : [],
            instance,
            intents,
            entities,
            ready,
        };
    }

    componentDidMount() {
        const { onLoad } = this.props;
        onLoad();
    }

    static getExamplesWithExtraSynonyms = (props) => {
        const { model: { training_data: { common_examples, entity_synonyms } = {} } = {} } = props;
        if (!common_examples) return [];
        return common_examples.map(e => _appendSynonymsToText(e, entity_synonyms));
    };

    validationRender = () => {
        const { activityLinkRender } = this.state;
        if (activityLinkRender === true) {
            this.setState({ activityLinkRender: false });
            return true;
        }
        return false;
    };

    onNewExamples = (examples, callback) => {
        const { model: { _id: modelId } = {} } = this.props;
        Meteor.call('nlu.insertExamples', modelId, examples.map(ExampleUtils.prepareExample), wrapMeteorCallback(callback));
    };

    onEditExample = (example, callback) => {
        const { model: { _id: modelId } = {} } = this.props;
        Meteor.call('nlu.updateExample', modelId, example, wrapMeteorCallback(callback));
    };

    onDeleteModel = () => {
        const { projectId, model: { _id: modelId } = {} } = this.props;
        browserHistory.push({ pathname: `/project/${projectId}/nlu/models` });
        Meteor.call('nlu.remove', modelId, projectId, wrapMeteorCallback(null, 'Model deleted!'));
    };

    onDeleteExample = (itemId) => {
        const { model: { _id: modelId } = {} } = this.props;
        Meteor.call('nlu.deleteExample', modelId, itemId, wrapMeteorCallback());
    };

    onSwitchCanonical = async (value) => {
        const { model: { _id: modelId } = {} } = this.props;
        return Meteor.callWithPromise('nlu.switchCanonical', modelId, value);
    };

    onUpdateModel = (set) => {
        const { model: { _id: modelId } = {} } = this.props;
        Meteor.call('nlu.update', modelId, set, wrapMeteorCallback(null, 'Information saved'));
    };

    getIntentForDropdown = (all) => {
        const { intents } = this.state;
        const intentSelection = all ? [{ text: 'ALL', value: null }] : [];
        intents.forEach((i) => {
            intentSelection.push({
                text: i,
                value: i,
            });
        });

        return intentSelection;
    };

    getNLUSecondaryPanes = () => {
        const { model, projectId, settings: { settings: { public: { chitChatProjectId = null } = {} } = {} } = {} } = this.props;
        const {
            examples, entities, intents, instance,
        } = this.state;

        const tabs = [
            {
                menuItem: 'Examples',
                render: () => (
                    <NluDataTable
                        onEditExample={this.onEditExample}
                        onDeleteExample={this.onDeleteExample}
                        onSwitchCanonical={this.onSwitchCanonical}
                        examples={examples}
                        entities={entities}
                        intents={intents}
                        projectId={projectId}
                    />
                ),
            },
            { menuItem: 'Synonyms', render: () => <Synonyms model={model} projectId={projectId} /> },
            { menuItem: 'Gazette', render: () => <Gazette model={model} projectId={projectId} /> },
            { menuItem: 'Out of Scope', render: () => <OutOfScope model={model} entities={entities} intents={intents} /> },
            { menuItem: 'API', render: () => (<API model={model} instance={instance} />) },
        ];

        if (can('nlu-data:w', projectId)) {
            tabs.push(
                { menuItem: 'Insert many', render: () => <IntentBulkInsert intents={intents} onNewExamples={this.onNewExamples} data-cy='insert-many' /> },
            );
            if (chitChatProjectId) tabs.splice(5, 0, { menuItem: 'Chit Chat', render: () => <ChitChat model={model} /> });
        }
        return tabs;
    };

    getSettingsSecondaryPanes = () => {
        const {
            model,
            projectDefaultLanguage,
            nluModelLanguages,
            projectId,
        } = this.props;
        const languageName = nluModelLanguages.find(language => (language.value === model.language));
        const cannotDelete = model.language !== projectDefaultLanguage;
        const tabs = [
            { menuItem: 'Pipeline', render: () => <NLUPipeline model={model} onSave={this.onUpdateModel} projectId={projectId} /> },
        ];

        if (can('projects:w', projectId)) {
            tabs.push({ menuItem: 'Delete', render: () => <DeleteModel model={model} onDeleteModel={this.onDeleteModel} cannotDelete={cannotDelete} language={languageName.text} /> });
        }
        return tabs;
    };

    handleLanguageChange = (value) => {
        const { models, projectId, changeWorkingLanguage } = this.props;
        const modelMatch = models.find(({ language }) => language === value);
        changeWorkingLanguage(value);
        browserHistory.push({ pathname: `/project/${projectId}/nlu/model/${modelMatch._id}` });
    }

    getHeader = () => {
        const { nluModelLanguages, workingLanguage } = this.props;
        return (
            <LanguageDropdown
                languageOptions={nluModelLanguages}
                selectedLanguage={workingLanguage}
                handleLanguageChange={this.handleLanguageChange}
            />
        );
    }


    handleMenuItemClick = (e, { name }) => this.setState({ activeItem: name });

    renderWarningMessage = () => {
        const { projectId } = this.props;
        return (
            <Message
                header='The model has no NLU instance set'
                icon='warning'
                content={(
                    <div>
                        Go to the
                        <Icon name='setting' />
                        {' Settings > General to assign an instance to this model to enable training and other NLU features. If you don\'t have instances you can '}
                        <Link to={`/project/${projectId}/settings`}>
                            create one
                        </Link>
                        in the <Icon name='server' />Instances menu.
                    </div>
                )}
                warning
            />
        );
    };

    renderWarningMessageIntents = () => {
        const { intents } = this.props;
        if (intents.length < 2) {
            return (
                <Message
                    size='tiny'
                    content={(
                        <div><Icon name='warning' />
                            You need at least two distinct intents to train NLU
                        </div>
                    )}
                    info
                />
            );
        }
        return <></>;
    }

    render() {
        const {
            projectId,
            model,
            project,
            project: {
                training: {
                    status,
                    endTime,
                } = {},
            } = {},
            ready,
            intents,
        } = this.props;
        const {
            activeItem, instance, entities, subPageInitialState,
        } = this.state;
        if (!project) return null;
        if (!model) return null;
        if (!ready || !model.training_data) {
            return (
                <Container text style={{ paddingTop: '6em' }}>
                    <Placeholder fluid>
                        <Placeholder.Header>
                            <Placeholder.Line />
                            <Placeholder.Line />
                        </Placeholder.Header>
                        <Placeholder.Paragraph>
                            <Placeholder.Line />
                            <Placeholder.Line />
                            <Placeholder.Line />
                        </Placeholder.Paragraph>
                        <Placeholder.Paragraph>
                            <Placeholder.Line />
                            <Placeholder.Line />
                            <Placeholder.Line />
                        </Placeholder.Paragraph>
                    </Placeholder>
                </Container>
            );
        }
        return (
            <div id='nlu-model'>
                <Menu borderless className='top-menu'>
                    <Menu.Item header>{this.getHeader()}</Menu.Item>
                    <Menu.Item name='data' active={activeItem === 'data'} onClick={this.handleMenuItemClick} data-cy='nlu-menu-training-data'>
                        <Icon size='small' name='database' />
                        Training Data
                    </Menu.Item>
                    {can('nlu-data:x') && (
                        <Menu.Item name='evaluation' active={activeItem === 'evaluation'} onClick={this.handleMenuItemClick} data-cy='nlu-menu-evaluation'>
                            <Icon size='small' name='percent' />
                            Evaluation
                        </Menu.Item>
                    )}
                    <Menu.Item name='statistics' active={activeItem === 'statistics'} onClick={this.handleMenuItemClick} data-cy='nlu-menu-statistics'>
                        <Icon size='small' name='pie graph' />
                        Statistics
                    </Menu.Item>
                    <Menu.Item name='settings' active={activeItem === 'settings'} onClick={this.handleMenuItemClick} data-cy='nlu-menu-settings'>
                        <Icon size='small' name='setting' />
                        Settings
                    </Menu.Item>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            {!isTraining(project) && status === 'success' && (
                                <Popup
                                    trigger={(
                                        <Icon size='small' name='check' fitted circular style={{ color: '#2c662d' }} />
                                    )}
                                    content={<Label basic content={<div>{`Trained ${moment(endTime).fromNow()}`}</div>} style={{ borderColor: '#2c662d', color: '#2c662d' }} />}
                                />
                            )}
                            {!isTraining(project) && status === 'failure' && (
                                <Popup
                                    trigger={(
                                        <Icon size='small' name='warning' color='red' fitted circular />
                                    )}
                                    content={<Label basic color='red' content={<div>{`Training failed ${moment(endTime).fromNow()}`}</div>} />}
                                />
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            <TrainButton project={project} instance={instance} projectId={projectId} />
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                <Container>
                    {['data', 'evaluation'].includes(activeItem) && (
                        <>
                            {this.renderWarningMessageIntents()}
                            <br />
                            {instance && can('nlu-data:r', projectId) && (
                                <div id='playground'>
                                    <NLUPlayground
                                        testMode
                                        model={model}
                                        projectId={projectId}
                                        instance={instance}
                                        floated='right'
                                        entities={entities}
                                        intents={this.getIntentForDropdown(false)}
                                        onSave={example => this.onNewExamples([example])}
                                        postSaveAction='clear'
                                    />
                                </div>
                            )}
                        </>
                    )}
                    <br />
                    {activeItem === 'data' && <Tab menu={{ pointing: true, secondary: true }} panes={this.getNLUSecondaryPanes()} />}
                    {activeItem === 'evaluation'
                        && (
                            can('nlu-data:r', projectId) && <Evaluation model={model} projectId={projectId} validationRender={this.validationRender} initialState={subPageInitialState} />
                        )
                    }
                    {activeItem === 'statistics' && <Statistics model={model} intents={intents} entities={entities} />}
                    {activeItem === 'settings' && <Tab menu={{ pointing: true, secondary: true }} panes={this.getSettingsSecondaryPanes()} />}
                </Container>
            </div>
        );
    }
}

NLUModel.propTypes = {
    model: PropTypes.object,
    projectId: PropTypes.string,
    intents: PropTypes.array,
    settings: PropTypes.object,
    ready: PropTypes.bool,
    nluModelLanguages: PropTypes.array,
    models: PropTypes.array,
    projectDefaultLanguage: PropTypes.string,
    project: PropTypes.object,
    // eslint-disable-next-line react/no-unused-prop-types
    instance: PropTypes.object,
    // instances is used in the get derived state from props function
    // eslint-disable-next-line react/no-unused-prop-types
    instances: PropTypes.array,
    location: PropTypes.object.isRequired,
    workingLanguage: PropTypes.string,
    changeWorkingLanguage: PropTypes.func.isRequired,
    onLoad: PropTypes.func.isRequired,
};

NLUModel.defaultProps = {
    intents: [],
    ready: false,
    nluModelLanguages: [],
    models: [],
    settings: {},
    projectDefaultLanguage: '',
    projectId: '',
    model: {},
    project: {},
    instance: null,
    instances: [],
    workingLanguage: null,
};

const handleDefaultRoute = (projectId, models, workingLanguage) => {
    // const { nlu_models: modelIds = [] } = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } }) || {};
    // const models = NLUModels.find({ _id: { $in: modelIds } }, { sort: { language: 1 } }).fetch();
    try {
        const reduxModel = models.find(model => model.language === workingLanguage);
        browserHistory.push({ pathname: `/project/${projectId}/nlu/model/${reduxModel._id}` });
    } catch (e) {
        browserHistory.push({ pathname: `/project/${projectId}/nlu/model/${models[0]._id}` });
    }
};

const NLUDataLoaderContainer = withTracker((props) => {
    const { params: { model_id: modelId, project_id: projectId } = {}, workingLanguage } = props;

    const {
        name,
        nlu_models,
        defaultLanguage,
        training,
        nluThreshold,
    } = Projects.findOne({ _id: projectId }, {
        fields: {
            name: 1, nlu_models: 1, defaultLanguage: 1, instance: 1, training: 1, nluThreshold: 1,
        },
    });
    const instances = Instances.find({ projectId }).fetch();
    // For handling '/project/:project_id/nlu/models'
    const models = NLUModels.find({ _id: { $in: nlu_models } }, { sort: { language: 1 } }, { fields: { language: 1, _id: 1 } }).fetch();
    if (!modelId || !nlu_models.includes(modelId)) {
        handleDefaultRoute(projectId, models, workingLanguage);
    }
    // for handling '/project/:project_id/nlu/model/:model_id'
    const instancesHandler = Meteor.subscribe('nlu_instances', projectId);
    const settingsHandler = Meteor.subscribe('settings');
    let modelHandler = {
        ready() {
            return false;
        },
    };
    if (modelId) {
        modelHandler = Meteor.subscribe('nlu_models', modelId);
    }
    const projectsHandler = Meteor.subscribe('projects', projectId);
    const ready = instancesHandler.ready() && settingsHandler.ready() && modelHandler.ready() && projectsHandler.ready();
    const model = NLUModels.findOne({ _id: modelId });
    if (!model) {
        return {};
    }
    const { training_data: { common_examples = [] } = {} } = model;
    const instance = Instances.findOne({ projectId });
    const intents = sortBy(uniq(common_examples.map(e => e.intent)));
    const entities = extractEntities(common_examples);
    const settings = GlobalSettings.findOne({}, { fields: { 'settings.public.chitChatProjectId': 1 } });

    if (!name) return browserHistory.replace({ pathname: '/404' });
    const nluModelLanguages = getNluModelLanguages(nlu_models, true);
    const projectDefaultLanguage = defaultLanguage;
    const project = {
        _id: projectId,
        training,
        nluThreshold,
    };
    return {
        instances,
        ready,
        models,
        model,
        intents,
        entities,
        projectId,
        settings,
        nluModelLanguages,
        projectDefaultLanguage,
        instance,
        project,
    };
})(WithRefreshOnLoad(NLUModel));

const mapStateToProps = state => ({
    workingLanguage: state.settings.get('workingLanguage'),
});

const mapDispatchToProps = {
    changeWorkingLanguage: setWorkingLanguage,
};

export default connect(mapStateToProps, mapDispatchToProps)(NLUDataLoaderContainer);
