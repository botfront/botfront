/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import { browserHistory, Link } from 'react-router';
import { withTracker } from 'meteor/react-meteor-data';
import { uniq, sortBy, find } from 'lodash';
import {
    Label,
    Container,
    Icon,
    Menu,
    Message,
    Tab,
    Popup,
    Placeholder,
    Dropdown,
} from 'semantic-ui-react';
import 'react-select/dist/react-select.css';
import { NLUModels } from '../../../../api/nlu_model/nlu_model.collection';
import { isTraining, getPublishedNluModelLanguages } from '../../../../api/nlu_model/nlu_model.utils';
import { Instances } from '../../../../api/instances/instances.collection';
import NluDataTable from './NluDataTable';
import NLUPlayground from '../../example_editor/NLUPlayground';
import Evaluation from '../evaluation/Evaluation';
import Activity from '../activity/Activity';
import ChitChat from './ChitChat';
import IntentBulkInsert from './IntentBulkInsert';
import Synonyms from '../../synonyms/Synonyms';
import Gazette from '../../synonyms/Gazette';
import NLUPipeline from './settings/NLUPipeline';
import DataImport from '../import-export/DataImport';
import DataExport from '../import-export/DataExport';
import TrainButton from '../../utils/TrainButton';
import Statistics from './Statistics';
import DeleteModel from '../import-export/DeleteModel';
import ExampleUtils from '../../utils/ExampleUtils';
import { _appendSynonymsToText } from '../../../../lib/filterExamples';
import { wrapMeteorCallback } from '../../utils/Errors';
import API from './API';
import { GlobalSettings } from '../../../../api/globalSettings/globalSettings.collection';
import { Projects } from '../../../../api/project/project.collection';

class NLUModel extends React.Component {
    constructor(props) {
        super(props);

        this.state = { activeItem: 'data', ...NLUModel.getDerivedStateFromProps(props), modelId: '' };
        this.activityLinkRender = false;
    }

    static getDerivedStateFromProps(props) {
        const {
            intents,
            entities,
            instances,
            ready,
            instance,
        } = props;
        return {
            examples: ready ? NLUModel.getExamplesWithExtraSynonyms(props) : [],
            instance: find(instances, i => i._id === instance),
            intents,
            entities,
            ready,
        };
    }

    static getExamplesWithExtraSynonyms = (props) => {
        const { model: { training_data: { common_examples, entity_synonyms } = {} } = {} } = props;
        if (!common_examples) return [];
        return common_examples.map(e => _appendSynonymsToText(e, entity_synonyms));
    };

    linkRender = () => {
        this.activityLinkRender = true;
        this.setState({ activeItem: 'evaluation' });
    };

    validationRender = () => {
        if (this.activityLinkRender) {
            this.activityLinkRender = false;
            return true;
        }

        return false;
    };

    onNewExample = (example) => {
        this.onNewExamples([example]);
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

    onRenameIntent = (oldIntent, newIntent, renameBotResponse = false) => {
        const { model: { _id: modelId } = {} } = this.props;
        Meteor.call('nlu.renameIntent', modelId, oldIntent, newIntent, renameBotResponse, wrapMeteorCallback());
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
                        onRenameIntent={this.onRenameIntent}
                        examples={examples}
                        entities={entities}
                        intents={intents}
                        projectId={projectId}
                    />
                ),
            },
            { menuItem: 'Insert many', render: () => <IntentBulkInsert intents={intents} onNewExamples={this.onNewExamples} /> },
            { menuItem: 'Synonyms', render: () => <Synonyms model={model} /> },
            { menuItem: 'Gazette', render: () => <Gazette model={model} /> },
            { menuItem: 'Statistics', render: () => <Statistics model={model} intents={intents} entities={entities} /> },
        ];
        if (chitChatProjectId) tabs.splice(4, 0, { menuItem: 'Chit Chat', render: () => <ChitChat model={model} /> });
        if (instance) {
            tabs.push({
                menuItem: 'API',
                render: () => (<API model={model} instance={instance} />),
            });
        }
        return tabs;
    };

    getSettingsSecondaryPanes = () => {
        const {
            model,
            intents,
            projectDefaultLanguage,
            nluModelLanguages,
        } = this.props;
        const { instance } = this.state;
        const languageName = nluModelLanguages.find(language => (language.value === model.language));
        const cannotDelete = model.language !== projectDefaultLanguage;
        return [
            { menuItem: 'Pipeline', render: () => <NLUPipeline model={model} onSave={this.onUpdateModel} /> },
            { menuItem: 'Import', render: () => <DataImport model={model} instanceHost={instance.host} /> },
            { menuItem: 'Export', render: () => <DataExport intents={intents} model={model} /> },
            { menuItem: 'Delete', render: () => <DeleteModel model={model} onDeleteModel={this.onDeleteModel} cannotDelete={cannotDelete} language={languageName.text} /> },
        ];
    };

    handleLanguageChange = (e, data) => {
        const { models, projectId } = this.props;
        // Fetch the model Id for data.value
        const modelToRender = models.find(model => (model.language === data.value));
        this.setState({ modelId: modelToRender.language }, browserHistory.push({ pathname: `/project/${projectId}/nlu/model/${modelToRender._id}` }));
    }

    getHeader = () => {
        const { nluModelLanguages, model } = this.props;
        let { modelId } = this.state;
        modelId = model.language;
        return (
            <Dropdown
                placeholder='Select Model'
                search
                selection
                value={modelId}
                options={nluModelLanguages}
                onChange={this.handleLanguageChange}
                data-cy='model-selector'
            />
        );
    };

    handleMenuItemClick = (e, { name }) => this.setState({ activeItem: name });

    renderWarningMessage = () => {
        const { projectId } = this.props;
        return (
            <Message
                header='The model has no NLU instance set'
                icon='warning'
                content={(
                    <div>
                        {'Go to the '}
                        <Icon name='setting' />
                        {' Settings > General to assign an instance to this model to enable training and other NLU features. If you don\'t have instances you can '}
                        <Link to={`/project/${projectId}/settings`}>
                            {'create one '}
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
            model: {
                _id: modelId,
            } = {},
            project,
            project: {
                training: {
                    status,
                    endTime,
                } = {},
            } = {},
            ready,
        } = this.props;
        const {
            activeItem, instance, entities, intents,
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
                <Menu pointing secondary>
                    <Menu.Item header>{this.getHeader()}</Menu.Item>
                    <Menu.Item name='activity' active={activeItem === 'activity'} onClick={this.handleMenuItemClick}>
                        <Icon size='small' name='history' />
                        {'Activity'}
                    </Menu.Item>
                    <Menu.Item name='data' active={activeItem === 'data'} onClick={this.handleMenuItemClick} className='nlu-menu-training-data'>
                        <Icon size='small' name='database' />
                        {'Training Data'}
                    </Menu.Item>
                    <Menu.Item name='evaluation' active={activeItem === 'evaluation'} onClick={this.handleMenuItemClick}>
                        <Icon size='small' name='percent' />
                        {'Evaluation'}
                    </Menu.Item>
                    <Menu.Item name='settings' active={activeItem === 'settings'} onClick={this.handleMenuItemClick} className='nlu-menu-settings' data-cy='settings-in-model'>
                        <Icon size='small' name='setting' />
                        {'Settings'}
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
                    <>{this.renderWarningMessageIntents()}</>
                    <br />
                    {instance && (
                        <div id='playground'>
                            <NLUPlayground
                                testMode
                                model={model}
                                projectId={projectId}
                                instance={instance}
                                floated='right'
                                entities={entities}
                                intents={this.getIntentForDropdown(false)}
                                onSave={this.onNewExample}
                                postSaveAction='clear'
                            />
                        </div>
                    )}
                    <br />
                    <br />
                    {activeItem === 'data' && <Tab menu={{ pointing: true, secondary: true }} panes={this.getNLUSecondaryPanes()} />}
                    {activeItem === 'evaluation' && <Evaluation model={model} projectId={projectId} validationRender={this.validationRender} />}
                    {activeItem === 'settings' && <Tab menu={{ pointing: true, secondary: true }} panes={this.getSettingsSecondaryPanes()} />}
                    {activeItem === 'activity' && <Activity project={project} modelId={modelId} entities={entities} intents={intents} linkRender={this.linkRender} instance={instance} />}
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
};

const handleDefaultRoute = (projectId) => {
    const { nlu_models: modelIds = [], defaultLanguage } = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1, defaultLanguage: 1 } }) || {};
    const models = NLUModels.find({ _id: { $in: modelIds } }, { sort: { language: 1 } }).fetch();

    try {
        const defaultModelId = models.find(model => model.language === defaultLanguage)._id;
        browserHistory.push({ pathname: `/project/${projectId}/nlu/model/${defaultModelId}` });
    } catch (e) {
        browserHistory.push({ pathname: `/project/${projectId}/nlu/model/${modelIds[0]}` });
    }
};

const NLUDataLoaderContainer = withTracker((props) => {
    const { params: { model_id: modelId, project_id: projectId } = {} } = props;

    const {
        name,
        nlu_models,
        defaultLanguage,
        instance,
        training,
    } = Projects.findOne({ _id: projectId }, {
        fields: {
            name: 1, nlu_models: 1, defaultLanguage: 1, instance: 1, training: 1,
        },
    });
    // For handling '/project/:project_id/nlu/models'
    if (!modelId || !nlu_models.includes(modelId)) {
        handleDefaultRoute(projectId);
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
    const instances = Instances.find({ projectId }).fetch();
    const intents = sortBy(uniq(common_examples.map(e => e.intent)));
    const entities = [];
    const settings = GlobalSettings.findOne({}, { fields: { 'settings.public.chitChatProjectId': 1 } });
    common_examples.forEach((e) => {
        if (e.entities) {
            e.entities.forEach((ent) => {
                if (entities.indexOf(ent.entity) === -1) {
                    entities.push(ent.entity);
                }
            });
        }
    });

    if (!name) return browserHistory.replace({ pathname: '/404' });
    const nluModelLanguages = getPublishedNluModelLanguages(nlu_models, true);
    const models = NLUModels.find({ _id: { $in: nlu_models }, published: true }, { sort: { language: 1 } }, { fields: { language: 1, _id: 1 } }).fetch();
    const projectDefaultLanguage = defaultLanguage;

    const project = {
        _id: projectId,
        training,
    };
    return {
        ready,
        models,
        model,
        instances,
        intents,
        entities,
        projectId,
        settings,
        nluModelLanguages,
        projectDefaultLanguage,
        instance,
        project,
    };
})(NLUModel);

export default NLUDataLoaderContainer;
