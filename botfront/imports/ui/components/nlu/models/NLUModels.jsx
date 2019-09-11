import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { browserHistory } from 'react-router';
import { cloneDeep, uniq } from 'lodash';
import {
    Button,
    Card,
    Container,
    Message,
    Icon,
    Menu,
    Segment,
    Popup, Tab, Header,
} from 'semantic-ui-react';

import { connect } from 'react-redux';
import { languages } from '../../../../lib/languages';
import { Projects } from '../../../../api/project/project.collection';
import { NLUModels as NLUModelsCollection } from '../../../../api/nlu_model/nlu_model.collection';
import { isTraining, getNluModelLanguages } from '../../../../api/nlu_model/nlu_model.utils';
import { wrapMeteorCallback } from '../../utils/Errors';
import getColor from '../../../../lib/getColors';
import { setWorkingLanguage } from '../../../store/actions/actions';

const NONE = -2;

class NLUModels extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editing: NONE,
            loading: false,
            // those states will take the id of the model on which
            // the popup must be displayed
            popupTurnOnModel: false,
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
        popupTurnOnModel: false,
    })

    renderMenu = () => (
        <Menu pointing secondary style={{ background: '#fff' }}>
            <Menu.Item>
                <Menu.Header as='h3'>
                    <Icon name='database' />
                    {' NLU Models'}
                </Menu.Header>
            </Menu.Item>
        </Menu>
    )

    onOpen = (model) => {
        const { projectId } = this.props;
        const { _id: modelId } = model;
        browserHistory.push({ pathname: `/project/${projectId}/nlu/model/${modelId}` });
    };

    publishModel = (modelId, projectId) => Meteor.call('nlu.publish', modelId, projectId, wrapMeteorCallback());

    renderModels = (models) => {
        const { projectId, project } = this.props;
        const {
            loading, popupTurnOnModel,
        } = this.state;
        const langs = uniq(models.map(m => m.language));
        const {
            training: {
                endTime,
                status,
            } = {},
        } = project;

        const ConfirmPopup = ({ title, onYes = () => {}, description = '' }) => (
            <Segment basic className='confirm-popup' data-cy='confirm-popup'>
                <Header as='h4'>{title}</Header>
                {description}
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
            } = model;

            const turnOnPopup = popupTurnOnModel === model._id;
            const languageString = languages[language].name;

            return (
                <Card
                    key={model._id}
                    color={getColor(langs.indexOf(model.language), true)}
                    id={`model-${model.name}`}
                    data-cy='nlu-model-card'
                >
                    <Card.Content>
                        {model.published ? (
                            <Button
                                icon='wifi'
                                basic
                                compact
                                size='mini'
                                color='green'
                                floated='right'
                                content='ONLINE'
                                data-cy='online-model'
                            />
                        ) : (
                            <Popup
                                on='click'
                                open={turnOnPopup}
                                onOpen={() => this.setState({ popupTurnOnModel: model._id })}
                                onClose={this.resetPopups}
                                content={(
                                    <ConfirmPopup
                                        title='Publish ?'
                                        onYes={() => this.publishModel(model._id, projectId)}
                                        description={`Your bot will use this model for ${languageString}`}
                                    />
                                )}
                                trigger={<Button compact size='mini' basic floated='right' content='OFFLINE' data-cy='offline-model' />}
                            />
                        )}
                        <Card.Header>{name}</Card.Header>
                        <Card.Meta>{languageString}</Card.Meta>
                        <Card.Description>
                            {description && <div style={{ marginBottom: '10px' }}>{description}</div>}
                            {!isTraining(project) && status === 'success' && (
                                <Message positive content={`Trained ${moment(endTime).fromNow()}`} size='mini' />
                            )}
                            {!isTraining(project) && status === 'failure' && (
                                <Message negative content={`Training failed ${moment(endTime).fromNow()}`} size='mini' />
                            )}
                            {isTraining(project) && status === 'training' && (
                                <Message info content={`Training started ${moment(project.training.startTime).fromNow()}...`} size='mini' />
                            )}
                        </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        <Button.Group basic floated='right'>
                            <Popup
                                trigger={(
                                    <Button
                                        data-cy='open-model'
                                        disabled={loading}
                                        primary
                                        icon='folder open'
                                        onClick={() => this.onOpen(model)}
                                    />
                                )}
                                content='Open model'
                            />
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
        render: () => <Card.Group style={{ margin: 'auto', maxWidth: '912px' }}>{this.renderModels(models.filter(m => m.language === lang))}</Card.Group>,
    }));

    onTabChange = (e, { activeIndex }) => {
        const { changeWorkingLanguage, models } = this.props;
        changeWorkingLanguage(getNluModelLanguages(models.map(m => m._id))[activeIndex]);
    };

    renderMessage = () => (
        <Message
            header='Botfront does not support several NLU models per language.'
            icon='warning'
            content={'Please delete all the models except the one you want to use in this project. In the meantime, only \'online\' models will be trainable'}
            warning
        />
    );

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
                    {this.renderMessage()}
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
    workingLanguage: PropTypes.string.isRequired,
    changeWorkingLanguage: PropTypes.func.isRequired,
    models: PropTypes.arrayOf(PropTypes.object).isRequired,
    project: PropTypes.object.isRequired,
};

const NLUModelsContainer = withTracker((props) => {
    const { project_id: projectId } = props.params;
    const { nlu_models: modelIds = [], training } = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1, training: 1 } }) || {};
    const models = NLUModelsCollection.find({ _id: { $in: modelIds } }, { sort: { language: 1 } }).fetch();

    const project = {
        _id: projectId,
        training,
    };
    
    return {
        projectId,
        models,
        project,
    };
})(NLUModels);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    workingLanguage: state.settings.get('workingLanguage'),
});

const mapDispatchToProps = {
    changeWorkingLanguage: setWorkingLanguage,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(NLUModelsContainer);
