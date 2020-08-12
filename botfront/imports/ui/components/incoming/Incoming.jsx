/* eslint-disable camelcase */
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Container } from 'semantic-ui-react';
import { browserHistory, withRouter } from 'react-router';
import { uniq, sortBy } from 'lodash';

import { Loading } from '../utils/Utils';
import { Projects } from '../../../api/project/project.collection';
import { NLUModels } from '../../../api/nlu_model/nlu_model.collection';
import { getNluModelLanguages } from '../../../api/nlu_model/nlu_model.utils';
import { Instances } from '../../../api/instances/instances.collection';
import TopMenu from './TopMenu';
import { extractEntities } from '../nlu/models/nluModel.utils';
import Activity from '../nlu/activity/Activity';
import ActivityInsertions from '../nlu/activity/ActivityInsertions';
import ConversationBrowser from '../conversations/ConversationsBrowser';
import { setWorkingLanguage } from '../../store/actions/actions';
import { updateIncomingPath } from './incoming.utils';
import { WithRefreshOnLoad } from '../../layouts/project';

class Incoming extends React.Component {
    state = {
        activeTab: undefined,
    };

    linkToEvaluation = () => {
        const { router, projectId, model } = this.props;
        router.push({ pathname: `/project/${projectId}/nlu/model/${model._id}`, state: { isActivityLinkRender: true } });
    };

    handleLanguageChange = (value) => {
        const { models, router, changeWorkingLanguage } = this.props;

        const modelMatch = models.find(({ language }) => language === value);

        if (modelMatch) {
            changeWorkingLanguage(value);
            const pathname = updateIncomingPath({ ...router.params, model_id: modelMatch._id });
            browserHistory.push({ pathname });
        }
    }

    handleTabClick = (itemKey) => {
        const { router } = this.props;
        this.setState({ activeTab: itemKey });
        const url = updateIncomingPath({ ...router.params, tab: itemKey });
        if (router.params.tab === url) return;
        browserHistory.push({ pathname: url });
    }

    componentDidMount = () => {
        const { router, onLoad } = this.props;
        const { activeTab } = this.state;
        onLoad();
        if (activeTab === undefined) {
            if (router.params.tab) {
                this.setState({ activeTab: router.params.tab });
            } else {
                this.setState({ activeTab: 'newutterances' });
            }
        }
    }

    renderPageContent = () => {
        const {
            model, instance, project, entities, intents,
        } = this.props;
        const { activeTab } = this.state;
        switch (activeTab) {
        case 'newutterances':
            return (
                <Activity project={project} model={model} instance={instance} entities={entities} intents={intents} linkRender={this.linkToEvaluation} />
            );
        case 'conversations':
            return (
                <ConversationBrowser projectId={project._id} />
            );
        case 'populate':
            return (
                <ActivityInsertions model={model} instance={instance} />
            );
        default: return <></>;
        }
    }

    render () {
        const {
            projectLanguages, ready, model, workingLanguage,
        } = this.props;
        const { activeTab } = this.state;
        return (
            <>
                <TopMenu
                    projectLanguages={projectLanguages}
                    selectedLanguage={workingLanguage}
                    handleLanguageChange={this.handleLanguageChange}
                    activeTab={activeTab}
                    tabs={[
                        { value: 'newutterances', text: 'New Utterances' },
                        { value: 'conversations', text: 'Conversations' },
                        { value: 'populate', text: 'Populate' },
                    ]}
                    onClickTab={this.handleTabClick}
                />
                <div>
                    <Container>
                        <Loading loading={!ready || !model}>
                            {this.renderPageContent()}
                        </Loading>
                    </Container>
                </div>
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
    params: PropTypes.object,
    router: PropTypes.object,
    workingLanguage: PropTypes.string,
    changeWorkingLanguage: PropTypes.func.isRequired,
    onLoad: PropTypes.func.isRequired,
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
    router: {},
    workingLanguage: null,
};

const handleDefaultRoute = (projectId) => {
    const { nlu_models: modelIds = [], defaultLanguage } = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1, defaultLanguage: 1 } }) || {};
    const models = NLUModels.find({ _id: { $in: modelIds } }, { sort: { language: 1 } }).fetch();

    try {
        const defaultModelId = models.find(model => model.language === defaultLanguage)._id;
        browserHistory.push({
            pathname: updateIncomingPath({ project_id: projectId, model_id: defaultModelId }),
        });
    } catch (e) {
        browserHistory.push({
            pathname: updateIncomingPath({ project_id: projectId, model_id: modelIds[0] }),
        });
    }
};

const IncomingContainer = withTracker((props) => {
    const {
        router: {
            params: {
                model_id: modelId, project_id: projectId,
            } = {},
        },
        workingLanguage,
        changeWorkingLanguage,
    } = props;

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
    const projectLanguages = getNluModelLanguages(project.nlu_models, true);

    // get instance and instanced
    const instancesHandler = Meteor.subscribe('nlu_instances', projectId);
    const instances = Instances.find({ projectId }).fetch();
    const instance = instances && instances.find(
        ({ projectId: instanceProjectId }) => instanceProjectId === projectId,
    );

    // get models and current model
    const models = NLUModels.find(
        { _id: { $in: project.nlu_models } },
        { sort: { language: 1 } },
        { fields: { language: 1, _id: 1 } },
    ).fetch();

    let model = {};
    try {
        const defaultModelId = models.find(modelMatch => modelMatch.language === project.defaultLanguage)._id;
        if (!modelId || !project.nlu_models.includes(modelId)) {
            handleDefaultRoute(projectId);
            model = NLUModels.findOne({ _id: defaultModelId || project.nlu_models[0] });
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

    if (!workingLanguage && model && model.language) changeWorkingLanguage(model.language);
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
    };
})(WithRefreshOnLoad(Incoming));

const IncomingContainerRouter = withRouter(IncomingContainer);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    workingLanguage: state.settings.get('workingLanguage'),
});

const mapDispatchToProps = {
    changeWorkingLanguage: setWorkingLanguage,
};

export default connect(mapStateToProps, mapDispatchToProps)(IncomingContainerRouter);
