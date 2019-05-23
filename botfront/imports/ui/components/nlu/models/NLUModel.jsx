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
} from 'semantic-ui-react';
import 'react-select/dist/react-select.css';
import { NLUModels } from '../../../../api/nlu_model/nlu_model.collection';
import { isTraining } from '../../../../api/nlu_model/nlu_model.utils';
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
import NLUParams from './settings/NLUParams';
import DataImport from '../import-export/DataImport';
import DataExport from '../import-export/DataExport';
import NLUTrainButton from './NLUTrainButton';
import Statistics from './Statistics';
import DeleteModel from '../import-export/DeleteModel';
import ExampleUtils from '../../utils/ExampleUtils';
import { _appendSynonymsToText } from '../../../../lib/filterExamples';
import { wrapMeteorCallback } from '../../utils/Errors';
import API from './API';
import { GlobalSettings } from '../../../../api/globalSettings/globalSettings.collection';
import { can } from '../../../../lib/scopes';

class NLUModel extends React.Component {
    constructor(props) {
        super(props);

        this.state = { activeItem: 'activity', ...NLUModel.getDerivedStateFromProps(props) };
        this.activityLinkRender = false;
    }

    static getDerivedStateFromProps(props) {
        const {
            intents,
            entities,
            instances,
            ready,
            model: {
                instance,
            } = {},
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

        const tabs = [];

        if (can('nlu-data:r', projectId)) {
            tabs.push(
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
            );
            if (can('nlu-data:w', projectId)) {
                tabs.push(
                    { menuItem: 'Insert many', render: () => <IntentBulkInsert intents={intents} onNewExamples={this.onNewExamples} data-cy='insert-many' /> },
                );
            }
            tabs.push(
                { menuItem: 'Synonyms', render: () => <Synonyms model={model} projectId={projectId} /> },
                { menuItem: 'Gazette', render: () => <Gazette model={model} projectId={projectId} /> },
                { menuItem: 'Statistics', render: () => <Statistics model={model} intents={intents} entities={entities} /> },
            );
            if (can('nlu-data:w', projectId)) {
                if (chitChatProjectId) tabs.splice(4, 0, { menuItem: 'Chit Chat', render: () => <ChitChat model={model} /> });
            }
            if (instance) tabs.push({ menuItem: 'API', render: () => <API model={model} instance={instance} /> });
        }
        return tabs;
    };

    getSettingsSecondaryPanes = () => {
        const {
            model, instances, intents, projectId,
        } = this.props;
        
        const tabs = [];
        
        if (can('nlu-meta:r', projectId)) {
            tabs.push({ menuItem: 'General', render: () => <NLUParams model={model} instances={instances} projectId={projectId} /> });
        }
        if (can('nlu-config:r', projectId)) {
            tabs.push({ menuItem: 'Pipeline', render: () => <NLUPipeline model={model} onSave={this.onUpdateModel} projectId={projectId} /> });
        }
        if (can('nlu-data:w', projectId)) {
            tabs.push({ menuItem: 'Import', render: () => <DataImport model={model} /> });
        }
        if (can('nlu-admin', projectId)) {
            tabs.push({ menuItem: 'Export', render: () => <DataExport intents={intents} model={model} /> });
            tabs.push({ menuItem: 'Delete', render: () => <DeleteModel model={model} onDeleteModel={this.onDeleteModel} /> });
        }
        return tabs;
    };

    getHeader = () => {
        const { projectId, model: { name, language } = {} } = this.props;
        return (
            <div className='model_header'>
                <Link to={`/project/${projectId}/nlu/models`}>
                    <strong>{`NLU Models > ${name} (${language})`}</strong>
                </Link>
            </div>
        );
    };

    renderMenuItems = (activeItem, model, status, endTime, instance) => {
        const { projectId } = this.props;
        const isVisible = can('nlu-data:r', projectId);
        if (isVisible) {
            return (
                <Menu pointing secondary>
                    <Menu.Item>{this.getHeader()}</Menu.Item>
                    <Menu.Item name='activity' active={activeItem === 'activity'} onClick={this.handleMenuItemClick} className='nlu-menu-activity'>
                        <Icon size='small' name='history' />
                        {'Activity'}
                    </Menu.Item>
                    <Menu.Item name='data' active={activeItem === 'data'} onClick={this.handleMenuItemClick} className='nlu-menu-training-data'>
                        <Icon size='small' name='database' />
                        {'Training Data'}
                    </Menu.Item>
                    <Menu.Item name='evaluation' active={activeItem === 'evaluation'} onClick={this.handleMenuItemClick} className='nlu-menu-evaluation'>
                        <Icon size='small' name='percent' />
                        {'Evaluation'}
                    </Menu.Item>
                    { can(['nlu-data:r'], projectId) && (
                        <Menu.Item name='settings' active={activeItem === 'settings'} onClick={this.handleMenuItemClick} className='nlu-menu-settings' data-cy='settings-in-model'>
                            <Icon size='small' name='setting' />
                            {'Settings'}
                        </Menu.Item>
                    )}
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            {!isTraining(model) && status === 'success' && (
                                <Popup
                                    trigger={(
                                        <Icon size='small' name='check' fitted circular style={{ color: '#2c662d' }} />
                                    )}
                                    content={<Label basic content={<div>{`Trained ${moment(endTime).fromNow()}`}</div>} style={{ borderColor: '#2c662d', color: '#2c662d' }} />}
                                />
                            )}
                            {!isTraining(model) && status === 'failure' && (
                                <Popup
                                    trigger={(
                                        <Icon size='small' name='warning' color='red' fitted circular />
                                    )}
                                    content={<Label basic color='red' content={<div>{`Training failed ${moment(endTime).fromNow()}`}</div>} />}
                                />
                            )}
                        </Menu.Item>
                        { can('nlu-model:x', projectId) && (
                            <Menu.Item>
                                <NLUTrainButton model={model} instance={instance} />
                            </Menu.Item>
                        )}
                    </Menu.Menu>
                </Menu>
            );
        }
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

    render() {
        const {
            projectId,
            model,
            model: {
                _id: modelId,
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
        if (!model) return null;
        if (!ready) {
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
                {this.renderMenuItems(activeItem, model, status, endTime, instance)}
                <Container>
                    <br />
                    {can('nlu-data:r', projectId) && (instance ? (
                        <div id='playground'>
                            <NLUPlayground
                                testMode
                                modelId={modelId}
                                projectId={projectId}
                                instance={instance}
                                floated='right'
                                entities={entities}
                                intents={this.getIntentForDropdown(false)}
                                onSave={this.onNewExample}
                                postSaveAction='clear'
                            />
                        </div>
                    ) : (
                        this.renderWarningMessage()
                    ))}
                    <br />
                    <br />
                    {activeItem === 'data' && <Tab menu={{ pointing: true, secondary: true }} panes={this.getNLUSecondaryPanes()} />}
                    {activeItem === 'evaluation' && can('nlu-data:r', projectId) && <Evaluation model={model} projectId={projectId} validationRender={this.validationRender} />}
                    {activeItem === 'settings' && can('nlu-data:r', projectId) && <Tab menu={{ pointing: true, secondary: true }} panes={this.getSettingsSecondaryPanes()} />}
                    {activeItem === 'activity' && can(['nlu-meta:r', 'nlu-data:r'], projectId) && <Activity modelId={modelId} entities={entities} intents={intents} linkRender={this.linkRender} instance={instance} projectId={projectId} />}
                </Container>
            </div>
        );
    }
}

NLUModel.propTypes = {
    model: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    instances: PropTypes.arrayOf(PropTypes.object),
    entities: PropTypes.array,
    intents: PropTypes.array,
    settings: PropTypes.object.isRequired,
    ready: PropTypes.bool.isRequired,
};

NLUModel.defaultProps = {
    instances: [],
    entities: [],
    intents: [],
};

const NLUDataLoaderContainer = withTracker((props) => {
    const { params: { model_id: modelId, project_id: projectId } = {} } = props;
    const instancesHandler = Meteor.subscribe('nlu_instances', projectId);
    const settingsHandler = Meteor.subscribe('settings');
    const modelHandler = Meteor.subscribe('nlu_models', modelId);
    const ready = instancesHandler.ready() && settingsHandler.ready() && modelHandler.ready();
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

    return {
        ready,
        model,
        instances,
        intents,
        entities,
        projectId,
        settings,
    };
})(NLUModel);

export default NLUDataLoaderContainer;
