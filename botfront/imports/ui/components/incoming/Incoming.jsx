/* eslint-disable camelcase */
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Menu, Container } from 'semantic-ui-react';
import { browserHistory } from 'react-router';
import { uniq, sortBy } from 'lodash';

import { Projects } from '../../../api/project/project.collection';
import { NLUModels } from '../../../api/nlu_model/nlu_model.collection';
import { getPublishedNluModelLanguages } from '../../../api/nlu_model/nlu_model.utils';
import { Instances } from '../../../api/instances/instances.collection';

import Activity from '../nlu/activity/Activity';

import LanguageDropdown from '../common/LanguageDropdown';

class Incoming extends React.Component {
    constructor (props) {
        super(props);
        const { model } = props;
        this.state = { selectedModel: model || {} };
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

    render () {
        const {
            projectLanguages, ready, entities, intents, modelId, project, model, instance, params, router,
        } = this.props;
        const { selectedModel } = this.state;


        // console.log(instances);
        if (!ready || !model) {
            return <div>loading</div>;
        }
        return (
            <>
                <Menu borderless className='top-menu'>
                    <Menu.Item header>
                        <LanguageDropdown
                            languageOptions={projectLanguages}
                            selectedLanguage={selectedModel.language}
                            handleLanguageChange={this.handleLanguageChange}
                        />
                    </Menu.Item>
                </Menu>
                <>
                    <Container>
                        <Activity
                            project={project}
                            modelId={modelId}
                            entities={entities}
                            intents={intents}
                            linkRender={this.linkToEvaluation}
                            instance={instance}
                            params={params}
                            replaceUrl={router.replace}
                        />
                    </Container>
                    
                </>
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
};

Incoming.defaultProps = {
    projectLanguages: [],
    projectId: '',
    // projectId: '',
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
};

const handleDefaultRoute = (projectId) => {
    const { nlu_models: modelIds = [], defaultLanguage } = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1, defaultLanguage: 1 } }) || {};
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

    let modelHandler = {
        ready() {
            return false;
        },
    };

    const instancesHandler = Meteor.subscribe('nlu_instances', projectId);
    const project = Projects.findOne({ _id: projectId }) || {};
    const projectLanguages = getPublishedNluModelLanguages(project.nlu_models, true);
    const instances = Instances.find({ projectId }).fetch();

    if (modelId) {
        modelHandler = Meteor.subscribe('nlu_models', modelId);
    }

    const instance = instances ? instances.find(({ _id }) => _id === project.instance) : undefined;
    const models = NLUModels.find({ _id: { $in: project.nlu_models }, published: true }, { sort: { language: 1 } }, { fields: { language: 1, _id: 1 } }).fetch();
    const defaultModelId = models.find(model => model.language === project.defaultLanguage)._id;
    let model = {};
    if (!modelId || !project.nlu_models.includes(modelId)) {
        handleDefaultRoute(projectId);
        model = NLUModels.findOne({ _id: defaultModelId });
    } else {
        model = NLUModels.findOne({ _id: modelId });
    }
    

    if (!model) {
        return {};
    }
    const { training_data: { common_examples = [] } = {} } = model;

    const intents = sortBy(uniq(common_examples.map(e => e.intent)));
    const entities = [];
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
        projectLanguages,
        ready: !!projectLanguages && !!instances && instancesHandler.ready() && modelHandler.ready() && !!instance,
        project,
        instances,
        instance,
        modelId,
        model,
        models,
        intents,
        entities,
    };
})(Incoming);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(IncomingContainer);
