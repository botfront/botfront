/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import { browserHistory } from 'react-router';
import { useTracker } from 'meteor/react-meteor-data';
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
import NLUPlayground from '../../example_editor/NLUPlayground';
import Evaluation from '../evaluation/Evaluation';
import ChitChat from './ChitChat';
import IntentBulkInsert from './IntentBulkInsert';
import Synonyms from '../../synonyms/Synonyms';
import Gazette from '../../synonyms/Gazette';
import NLUPipeline from './settings/NLUPipeline';
import TrainButton from '../../utils/TrainButton';
import Statistics from './Statistics';
import DeleteModel from './DeleteModel';
import ExampleUtils from '../../utils/ExampleUtils';
import LanguageDropdown from '../../common/LanguageDropdown';
import { wrapMeteorCallback } from '../../utils/Errors';
import API from './API';
import { GlobalSettings } from '../../../../api/globalSettings/globalSettings.collection';
import { Projects } from '../../../../api/project/project.collection';
import { setWorkingLanguage } from '../../../store/actions/actions';
import NluTable from './NluTable';
import { WithRefreshOnLoad } from '../../../layouts/project';

const handleDefaultRoute = (projectId, models, workingLanguage) => {
    try {
        const reduxModel = models.find(model => model.language === workingLanguage);
        browserHistory.push({ pathname: `/project/${projectId}/nlu/model/${reduxModel._id}` });
    } catch (e) {
        browserHistory.push({ pathname: `/project/${projectId}/nlu/model/${models[0]._id}` });
    }
};

function NLUModel(props) {
    const { location: { state: incomingState }, params: { model_id: modelId, project_id: projectId } = {}, workingLanguage } = props;

    const {
        ready,
        models,
        model,
        settings,
        nluModelLanguages,
        projectDefaultLanguage,
        instance,
        project,
    } = useTracker(() => {
        const {
            name,
            nlu_models,
            defaultLanguage,
            training,
            enableSharing,
        } = Projects.findOne({ _id: projectId }, {
            fields: {
                name: 1, nlu_models: 1, defaultLanguage: 1, training: 1, enableSharing: 1,
            },
        });


        const modelsList = NLUModels.find({ _id: { $in: nlu_models } }, { sort: { language: 1 } }, { fields: { language: 1, _id: 1 } }).fetch();
        if (!modelId || !nlu_models.includes(modelId)) {
            handleDefaultRoute(projectId, models, workingLanguage);
        }
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
        const meteorSubscribtionReady = instancesHandler.ready() && settingsHandler.ready() && modelHandler.ready() && projectsHandler.ready();
        const currentModel = NLUModels.findOne({ _id: modelId });
        if (!currentModel) {
            return {};
        }


        const projectInstance = Instances.findOne({ projectId });

        const settingsChitChatId = GlobalSettings.findOne({}, { fields: { 'settings.public.chitChatProjectId': 1 } });

        if (!name) return browserHistory.replace({ pathname: '/404' });
        const availableLanguages = getNluModelLanguages(nlu_models, true);
        const currentProject = {
            _id: projectId,
            training,
            enableSharing,
        };
        return {
            ready: meteorSubscribtionReady,
            models: modelsList,
            model: currentModel,
            settings: settingsChitChatId,
            nluModelLanguages: availableLanguages,
            projectDefaultLanguage: defaultLanguage,
            instance: projectInstance,
            project: currentProject,
        };
    });

    const intents = [];
    const entities = [];

    // const intents = sortBy(uniq(data.map(e => e.intent)));
    // const entities = extractEntities(data);

    const [activityLinkRender, setActivityLinkRender] = useState((incomingState && incomingState.isActivityLinkRender) || false);
    const [activeItem, setActiveItem] = useState(incomingState && incomingState.isActivityLinkRender === true ? 'evaluation' : 'data');


    useEffect(() => {
        const { onLoad } = props;
        onLoad();
    }, []);

    const validationRender = () => {
        if (activityLinkRender === true) {
            setActivityLinkRender(false);
            return true;
        }
        return false;
    };

    const onNewExamples = (newExamples, callback) => {
        Meteor.call('nlu.insertExamples', modelId, newExamples.map(ExampleUtils.prepareExample), wrapMeteorCallback(callback));
    };


    const onDeleteModel = () => {
        browserHistory.push({ pathname: `/project/${projectId}/nlu/models` });
        Meteor.call('nlu.remove', modelId, projectId, wrapMeteorCallback(null, 'Model deleted!'));
    };


    const onUpdateModel = (set) => {
        Meteor.call('nlu.update', modelId, set, wrapMeteorCallback(null, 'Information saved'));
    };


    const getIntentForDropdown = (all) => {
        const intentSelection = all ? [{ text: 'ALL', value: null }] : [];
        intents.forEach((i) => {
            intentSelection.push({
                text: i,
                value: i,
            });
        });

        return intentSelection;
    };


    const handleLanguageChange = (value) => {
        const { changeWorkingLanguage } = props;
        const modelMatch = models.find(({ language }) => language === value);
        changeWorkingLanguage(value);
        browserHistory.push({ pathname: `/project/${projectId}/nlu/model/${modelMatch._id}` });
    };

    const getHeader = () => (
        <LanguageDropdown
            languageOptions={nluModelLanguages}
            selectedLanguage={workingLanguage}
            handleLanguageChange={handleLanguageChange}
        />
    );

    const handleMenuItemClick = (e, { name }) => setActiveItem(name);

    const renderWarningMessageIntents = () => {
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
    };


    const getNLUSecondaryPanes = () => {
        const { settings: { public: { chitChatProjectId = null } = {} } = {} } = settings;
        const tabs = [
            {
                menuItem: 'Examples',
                render: () => (
                    <NluTable projectId={projectId} workingLanguage={workingLanguage} entitySynonyms={model.training_data.entity_synonyms} />
                ),
            },
            { menuItem: 'Synonyms', render: () => <Synonyms model={model} /> },
            { menuItem: 'Gazette', render: () => <Gazette model={model} /> },
            { menuItem: 'API', render: () => (<API model={model} instance={instance} />) },
            { menuItem: 'Insert many', render: () => <IntentBulkInsert onNewExamples={this.onNewExamples} data-cy='insert-many' /> },
        ];
        if (chitChatProjectId) tabs.splice(4, 0, { menuItem: 'Chit Chat', render: () => <ChitChat model={model} /> });
        return tabs;
    };

    const getSettingsSecondaryPanes = () => {
        const languageName = nluModelLanguages.find(language => (language.value === model.language));
        const cannotDelete = model.language !== projectDefaultLanguage;
        return [
            { menuItem: 'Pipeline', render: () => <NLUPipeline model={model} onSave={onUpdateModel} projectId={projectId} /> },
            { menuItem: 'Delete', render: () => <DeleteModel model={model} onDeleteModel={onDeleteModel} cannotDelete={cannotDelete} language={languageName.text} /> },
        ];
    };

    const renderNluScreens = () => {
        if (!project) return null;
        if (!model) return null;
        const {
            training: {
                status,
                endTime,
            } = {},
        } = project;
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
                    <Menu.Item header>{getHeader()}</Menu.Item>
                    <Menu.Item name='data' active={activeItem === 'data'} onClick={handleMenuItemClick} data-cy='nlu-menu-training-data'>
                        <Icon size='small' name='database' />
                        Training Data
                    </Menu.Item>
                    <Menu.Item name='evaluation' active={activeItem === 'evaluation'} onClick={handleMenuItemClick} data-cy='nlu-menu-evaluation'>
                        <Icon size='small' name='percent' />
                        Evaluation
                    </Menu.Item>
                    <Menu.Item name='statistics' active={activeItem === 'statistics'} onClick={handleMenuItemClick} data-cy='nlu-menu-statistics'>
                        <Icon size='small' name='pie graph' />
                        Statistics
                    </Menu.Item>
                    <Menu.Item name='settings' active={activeItem === 'settings'} onClick={handleMenuItemClick} data-cy='nlu-menu-settings'>
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
                            {renderWarningMessageIntents()}
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
                                        intents={getIntentForDropdown(false)}
                                        onSave={example => onNewExamples([example])}
                                        postSaveAction='clear'
                                    />
                                </div>
                            )}
                        </>
                    )}
                    <br />
                    {activeItem === 'data' && <Tab menu={{ pointing: true, secondary: true }} panes={getNLUSecondaryPanes()} />}
                    {activeItem === 'evaluation' && <Evaluation model={model} projectId={projectId} validationRender={validationRender} />}
                    {/* if this comment is visible during the last review, it means I forgot to fix the statistics page */}
                    {activeItem === 'statistics' && <Statistics model={model} intents={intents} entities={entities} examples={[]} />}
                    {activeItem === 'settings' && <Tab menu={{ pointing: true, secondary: true }} panes={getSettingsSecondaryPanes()} />}
                </Container>
            </div>
        );
    };

    return renderNluScreens();
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
    location: PropTypes.object.isRequired,
    workingLanguage: PropTypes.string,
    changeWorkingLanguage: PropTypes.func.isRequired,
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
    workingLanguage: null,
};


const mapStateToProps = state => ({
    workingLanguage: state.settings.get('workingLanguage'),
});

const mapDispatchToProps = {
    changeWorkingLanguage: setWorkingLanguage,
};


export default connect(mapStateToProps, mapDispatchToProps)(WithRefreshOnLoad(NLUModel));
