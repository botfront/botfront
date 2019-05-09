import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { browserHistory } from 'react-router';
import { cloneDeep, uniq } from 'lodash';
import {
    AutoField,
    AutoForm,
    ErrorsField,
    SubmitField,
} from 'uniforms-semantic';
import {
    Button,
    Card,
    Container,
    Message,
    Icon,
    Label,
    Menu,
    Segment,
    Popup, Confirm, Tab, Header,
} from 'semantic-ui-react';

import { connect } from 'react-redux';
import SelectLanguage from '../common/SelectLanguage';
import SelectInstanceField from './settings/SelectInstanceField';
import { Instances } from '../../../../api/instances/instances.collection';
import { languages } from '../../../../lib/languages';
import { Projects } from '../../../../api/project/project.collection';
import { NLUModels as NLUModelsCollection } from '../../../../api/nlu_model/nlu_model.collection';
import { NLUModelSchema } from '../../../../api/nlu_model/nlu_model.schema';
import { isTraining, getNluModelLanguages } from '../../../../api/nlu_model/nlu_model.utils';
import { wrapMeteorCallback } from '../../utils/Errors';
import getColor from '../../../../lib/getColors';
import { setWorkingLanguage } from '../../../store/actions/actions';

const NONE = -2;
const NEW_MODEL = -1;

class NLUModels extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editing: NONE,
            confirmOpen: false,
            modelToPublish: null,
            loading: false,
            // those states will take the id of the model on which
            // the popup must be displayed
            popupDuplicateModel: false,
            popupTurnOnModel: false,
            popupTurnOffModel: false,
            tipDuplicateModel: false,
        };
        this.fixLanguage();
    }

    componentWillReceiveProps(nextProps) {
        this.props = nextProps;
        this.fixLanguage();
    }

    fixLanguage = () => {
        const { workingLanguage, models, changeWorkingLanguage } = this.props;
        // If a user:
        // - deletes the last model in a given language
        // - comes from another project and has a working language not in current model languages
        const modelsLanguages = getNluModelLanguages(models.map(m => m._id));
        if (models.length > 0 && modelsLanguages.indexOf(workingLanguage) < 0) {
            changeWorkingLanguage(modelsLanguages[0]);
        }
    };

    createOrUpdateModel = (model) => {
        const { projectId, changeWorkingLanguage } = this.props;
        this.setState({ loading: true });
        Meteor.call('nlu.insert', model, projectId, wrapMeteorCallback(() => {
            changeWorkingLanguage(model.language);
            this.setState({ editing: NONE, loading: false });
        }));
    };

    handleDuplicateModel = (model) => {
        const copy = cloneDeep(model);
        copy.name = `Copy of ${model.name}`;
        copy.evaluations = [];
        delete copy.training;
        delete copy._id;
        copy.published = false;
        this.createOrUpdateModel(copy);
        this.resetPopups();
    };

    resetPopups = () => this.setState({
        popupDuplicateModel: false,
        popupTurnOffModel: false,
        popupTurnOnModel: false,
        tipDuplicateModel: false,
    })

    renderMenu = () => {
        const { loading, editing } = this.state;
        const { ready } = this.props;

        return (
            <Menu pointing secondary style={{ background: '#fff' }}>
                <Menu.Item>
                    <Menu.Header as='h3'>
                        <Icon name='database' />
                        {' NLU Models'}
                    </Menu.Header>
                </Menu.Item>
                <Menu.Menu position='right'>
                    <Menu.Item>
                        <Button
                            className='new-model'
                            onClick={() => this.setState({ editing: NEW_MODEL })}
                            primary
                            disabled={!ready || loading || editing !== NONE}
                            icon='add'
                            content='New model'
                            labelPosition='left'
                        />
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
        );
    };

    onOpen = (model) => {
        const { projectId } = this.props;
        const { _id: modelId } = model;
        browserHistory.push({ pathname: `/project/${projectId}/nlu/model/${modelId}` });
    };

    publishModel = (modelId, projectId) => Meteor.call('nlu.publish', modelId, projectId, wrapMeteorCallback(() => {
        this.setState({ confirmOpen: false });
    }));

    renderModels = (models) => {
        const { projectId } = this.props;
        const {
            loading, confirmOpen, modelToPublish, popupDuplicateModel, popupTurnOffModel, popupTurnOnModel, tipDuplicateModel,
        } = this.state;
        const langs = uniq(models.map(m => m.language));

        const renderDuplicateButton = (disabled, onClick = () => {}) => (
            <Button
                className='duplicate-model-button'
                disabled={disabled}
                secondary
                onClick={onClick}
                icon='copy'
            />
        );

        const ConfirmPopup = ({ title, onYes = () => {} }) => (
            <Segment basic className='model-popup'>
                <Header as='h4'>{title}</Header>
                <div>
                    <Button
                        negative
                        onClick={this.resetPopups}
                        size='tiny'
                    >
                    No
                    </Button>
                    <Button
                        primary
                        onClick={onYes}
                        size='tiny'
                    >
                    Yes
                    </Button>
                </div>
            </Segment>
        );

        return models.map((model) => {
            const {
                name,
                language,
                description,
                training: {
                    status,
                    endTime,
                } = {},
            } = model;

            const duplicatePopup = popupDuplicateModel === model._id;
            const turnOffPopup = popupTurnOffModel === model._id;
            const turnOnPopup = popupTurnOnModel === model._id;
            const duplicateTip = tipDuplicateModel === model._id;

            return (
                <Card
                    key={model._id}
                    color={getColor(langs.indexOf(model.language), true)}
                    id={`model-${model.name}`}
                >
                    {modelToPublish && (
                        <Confirm
                            open={confirmOpen}
                            header={`Publish model ${modelToPublish.name}?`}
                            icon='warning'
                            content='Do not forget to train your model if you recently modified your training data!'
                            onCancel={() => this.setState({ confirmOpen: false })}
                            onConfirm={() => this.publishModel(modelToPublish._id, projectId)}
                        />
                    )}
                    <Card.Content>
                        {model.published && <Button icon='wifi' basic compact size='mini' color='green' floated='right' content='ONLINE' />}
                        {!model.published && <Button compact size='mini' basic floated='right' content='OFFLINE' onClick={() => this.setState({ confirmOpen: true, modelToPublish: model })} />}
                        <Card.Header>{name}</Card.Header>
                        <Card.Meta>{languages[language].name}</Card.Meta>
                        <Card.Description>
                            {description && <div style={{ marginBottom: '10px' }}>{description}</div>}
                            {!isTraining(model) && status === 'success' && (
                                <Message positive content={`Trained ${moment(endTime).fromNow()}`} size='mini' />
                            )}
                            {!isTraining(model) && status === 'failure' && (
                                <Message negative content={`Training failed ${moment(endTime).fromNow()}`} size='mini' />
                            )}
                            {isTraining(model) && status === 'training' && (
                                <Message info content={`Training started ${moment(model.training.startTime).fromNow()}...`} size='mini' />
                            )}
                        </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        <Button.Group basic floated='right'>
                            <Popup
                                trigger={(
                                    <Button
                                        className='open-model-button'
                                        disabled={loading}
                                        primary
                                        icon='folder open'
                                        onClick={() => this.onOpen(model)}
                                    />
                                )}
                                content='Open model'
                            />
                            {popupDuplicateModel === model._id ? (
                                <Popup
                                    on='click'
                                    open={duplicatePopup}
                                    onClose={this.resetPopups}
                                    trigger={renderDuplicateButton(loading, this.resetPopups)}
                                    content={<ConfirmPopup title='Duplicate model ?' onYes={() => this.handleDuplicateModel(model)} />}
                                />
                            ) : (
                                <Popup
                                    trigger={renderDuplicateButton(loading, () => this.setState({ popupDuplicateModel: model._id }))}
                                    open={duplicateTip}
                                    onOpen={() => this.setState({ tipDuplicateModel: model._id })}
                                    onClose={() => this.setState({ tipDuplicateModel: false })}
                                    content='Create a copy'
                                />
                            )}
                        </Button.Group>
                    </Card.Content>
                </Card>
            );
        });
    };

    renderNoModel = () => (
        <Message
            info
            icon='warning'
            header='You haven&#39;t created models yet'
            content={(
                <div>
                    Click on the&nbsp;
                    <strong>New Model</strong>
                    &nbsp;button to create your first NLU model.
                </div>
            )}
        />
    );

    getPanes = models => getNluModelLanguages(models.map(m => m._id)).map(lang => ({
        menuItem: languages[lang].name,
        render: () => <Card.Group style={{ margin: 0 }}>{this.renderModels(models.filter(m => m.language === lang))}</Card.Group>,
    }));

    onTabChange = (e, { activeIndex }) => {
        const { changeWorkingLanguage, models } = this.props;
        changeWorkingLanguage(getNluModelLanguages(models.map(m => m._id))[activeIndex]);
    };

    renderAddOrEditModel() {
        const { instances } = this.props;

        return (
            <Card raised>
                <Card.Content extra>
                    <div>
                        <Label attached='top right' as='a' icon='close' onClick={() => this.setState({ editing: NONE })} />
                        <AutoForm schema={NLUModelSchema} model={{}} onSubmit={model => this.createOrUpdateModel(model)}>
                            <AutoField name='name' label='Model name' />
                            <SelectLanguage name='language' label='Language' />
                            <AutoField name='description' />
                            <SelectInstanceField name='instance' label='NLU Instance' instances={instances} />
                            <ErrorsField />
                            <SubmitField data-cy='model-save-button' value='Save model' className='primary' />
                        </AutoForm>
                    </div>
                </Card.Content>
            </Card>
        );
    }

    render() {
        const { editing } = this.state;
        const { models, workingLanguage } = this.props;
        const activeIndex = getNluModelLanguages(models.map(m => m._id)).indexOf(workingLanguage);
        const nluLanguages = getNluModelLanguages(models.map(m => m._id));
        return (
            <div>
                {this.renderMenu()}
                <br />
                <Container>
                    {editing === NEW_MODEL && this.renderAddOrEditModel({})}
                    {nluLanguages.length === 0 && editing === NONE && this.renderNoModel()}
                    {nluLanguages.length > 0 && (
                        <Tab
                            menu={{ pointing: true, secondary: true }}
                            panes={this.getPanes(models)}
                            onTabChange={this.onTabChange}
                            activeIndex={activeIndex}
                        />)
                    }
                </Container>
            </div>
        );
    }
}

NLUModels.propTypes = {
    projectId: PropTypes.string.isRequired,
    instances: PropTypes.arrayOf(PropTypes.object).isRequired,
    workingLanguage: PropTypes.string.isRequired,
    changeWorkingLanguage: PropTypes.func.isRequired,
    models: PropTypes.arrayOf(PropTypes.object).isRequired,
    ready: PropTypes.bool.isRequired,
};

const NLUModelsContainer = withTracker((props) => {
    const { project_id: projectId } = props.params;
    const instancesHandler = Meteor.subscribe('nlu_instances', projectId);

    const { nlu_models: modelIds = [] } = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } }) || {};
    const models = NLUModelsCollection.find({ _id: { $in: modelIds } }, { sort: { language: 1 } }).fetch();
    
    const instances = Instances.find({ projectId }).fetch();
    return {
        ready: instancesHandler.ready(),
        projectId,
        instances,
        models,
    };
})(NLUModels);

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
    workingLanguage: state.get('workingLanguage'),
});

const mapDispatchToProps = {
    changeWorkingLanguage: setWorkingLanguage,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(NLUModelsContainer);
