/* eslint-disable camelcase */
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Menu, Container } from 'semantic-ui-react';
import { browserHistory } from 'react-router';
import { uniq, sortBy } from 'lodash';
import { setWorkingDeploymentEnvironment } from '../../store/actions/actions';

import { Loading } from '../utils/Utils';
import { Projects } from '../../../api/project/project.collection';
import { NLUModels } from '../../../api/nlu_model/nlu_model.collection';
import { getPublishedNluModelLanguages } from '../../../api/nlu_model/nlu_model.utils';
import { Instances } from '../../../api/instances/instances.collection';
import TopMenu from './TopMenu';

import { extractEntities } from '../nlu/models/nluModel.utils';

import Activity from '../nlu/activity/Activity';

import LanguageDropdown from '../common/LanguageDropdown';

class Incoming extends React.Component {
    constructor (props) {
        super(props);
        const { model, workingEnvironment } = props;
        this.state = { selectedModel: model || {}, selectedEnvironment: workingEnvironment };
    }

    linkToEvaluation = () => {
        const { router, projectId, model } = this.props;
        router.push({ pathname: `/project/${projectId}/nlu/model/${model._id}`, state: { isActivityLinkRender: true } });
    };

    handleLanguageChange = (value) => {
        const { models, projectId } = this.props;

        const modelMatch = models.find(({ language }) => language === value);
        if (modelMatch) {
            this.setState({ selectedModel: modelMatch }, browserHistory.push({ pathname: `/project/${projectId}/incoming/${modelMatch._id}` }));
        }
    }

    handleEnvChange = (value) => {
        const { changeWorkingEnv } = this.props;
        this.setState({ selectedEnvironment: value });
        changeWorkingEnv(value);
    }

    renderTopMenu = () => {
        const {
            projectLanguages,
        } = this.props;
        const { selectedModel } = this.state;
        return (
            <Menu borderless className='top-menu'>
                <Menu.Item header>
                    <LanguageDropdown
                        languageOptions={projectLanguages}
                        selectedLanguage={selectedModel.language}
                        handleLanguageChange={this.handleLanguageChange}
                    />
                </Menu.Item>
            </Menu>
        );
    }


    render () {
        const {
            projectLanguages, ready, entities, intents, modelId, project, model, instance, params, router, projectEnvironments,
        } = this.props;
        const { selectedModel, selectedEnvironment } = this.state;
        return (
            <>
                <TopMenu
                    projectLanguages={projectLanguages}
                    selectedModel={selectedModel}
                    handleLanguageChange={this.handleLanguageChange}
                    projectEnvironments={projectEnvironments}
                    handleEnvChange={this.handleEnvChange}
                    selectedEnvironment={selectedEnvironment}
                />
                <Container>
                    <Loading loading={!ready || !model}>
                        <Activity
                            project={project}
                            modelId={modelId}
                            entities={entities}
                            intents={intents}
                            linkRender={this.linkToEvaluation}
                            instance={instance}
                            params={params}
                            replaceUrl={router.replace}
                            environment={selectedEnvironment}
                        />
                    </Loading>
                </Container>
            </>
        );
    }
}

Incoming.propTypes = {
    projectLanguages: PropTypes.array,
    projectId: PropTypes.string,
    project: PropTypes.object,
    ready: PropTypes.bool,
    model: PropTypes.object,
    models: PropTypes.array,
    entities: PropTypes.array,
    intents: PropTypes.array,
    instance: PropTypes.object,
    modelId: PropTypes.string,
    params: PropTypes.object,
    router: PropTypes.object,
    projectEnvironments: PropTypes.array,
    workingEnvironment: PropTypes.string.isRequired,
    changeWorkingEnv: PropTypes.func.isRequired,
};

Incoming.defaultProps = {
    projectLanguages: [],
    projectId: '',
    ready: false,
    params: {},
    intents: [],
    models: [],
    model: {},
    project: {},
    instance: {},
    entities: [],
    modelId: '',
    router: {},
    projectEnvironments: ['development'],
};

const handleDefaultRoute = (projectId) => {
    const { nlu_models: modelIds = [], defaultLanguage } = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1, defaultLanguage: 1, deploymentEnvironments: 1 } }) || {};
    const models = NLUModels.find({ _id: { $in: modelIds } }, { sort: { language: 1 } }).fetch();

    try {
        const defaultModelId = models.find(model => model.language === defaultLanguage)._id;
        browserHistory.push({ pathname: `/project/${projectId}/incoming/${defaultModelId}` });
    } catch (e) {
        browserHistory.push({ pathname: `/project/${projectId}/incoming/${modelIds[0]}` });
    }
};

const IncomingContainer = withTracker((props) => {
    const { params: { model_id: modelId, project_id: projectId } = {} } = props;

    // setup model subscription
    let modelHandler = {
        ready() {
            return false;
        },
    };
    if (modelId) {
        modelHandler = Meteor.subscribe('nlu_models', modelId);
    }

    // get project and projectLanguages
    const project = Projects.findOne({ _id: projectId }) || {};
    const projectLanguages = getPublishedNluModelLanguages(project.nlu_models, true);

    // get instance and instanced
    const instancesHandler = Meteor.subscribe('nlu_instances', projectId);
    const instances = Instances.find({ projectId }).fetch();
    const instance = instances && instances.find(
        ({ projectId: instanceProjectId }) => instanceProjectId === projectId,
    );

    // get models and current model
    const models = NLUModels.find(
        { _id: { $in: project.nlu_models }, published: true },
        { sort: { language: 1 } },
        { fields: { language: 1, _id: 1 } },
    ).fetch();

    let model = {};
    try {
        const defaultModelId = models.find(modelMatch => modelMatch.language === project.defaultLanguage)._id;
        if (!modelId || !project.nlu_models.includes(modelId)) {
            handleDefaultRoute(projectId);
            model = NLUModels.findOne({ _id: defaultModelId });
        } else {
            model = NLUModels.findOne({ _id: modelId });
        }
    } catch (err) {
        model = { training_data: { common_examples: [] } };
    }

    // SECTION
    const { training_data: { common_examples = [] } = {} } = model;
    const intents = sortBy(uniq(common_examples.map(e => e.intent)));
    const entities = extractEntities(common_examples);

    // get this from a param if it exists
    const environment = 'development';
    const { deploymentEnvironments } = project;
    console.log(deploymentEnvironments);
    // End
    return {
        projectLanguages,
        ready: !!projectLanguages && instancesHandler.ready() && modelHandler.ready() && !!instance,
        project,
        instances,
        instance,
        modelId,
        model,
        models,
        intents,
        entities,
        environment,
        projectEnvironments: ['development', ...deploymentEnvironments],
    };
})(Incoming);

const mapStateToProps = state => ({
    workingEnvironment: state.settings.get('workingDeploymentEnvironment'),
    projectId: state.settings.get('projectId'),
});

const mapDispatchToProps = {
    changeWorkingEnv: setWorkingDeploymentEnvironment,
};

export default connect(mapStateToProps, mapDispatchToProps)(IncomingContainer);
