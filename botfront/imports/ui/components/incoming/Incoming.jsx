/* eslint-disable camelcase */
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Menu, Container, Tab } from 'semantic-ui-react';
import { browserHistory, Link } from 'react-router';
import { uniq, sortBy, find } from 'lodash';

import { Projects } from '../../../api/project/project.collection';
import { NLUModels } from '../../../api/nlu_model/nlu_model.collection';
import { getPublishedNluModelLanguages, getNluModelLanguages } from '../../../api/nlu_model/nlu_model.utils';
import { Instances } from '../../../api/instances/instances.collection';

import ConversationsBrowser from '../conversations/ConversationsBrowser.jsx';
import Activity from '../nlu/activity/Activity';

import LanguageDropdown from '../common/LanguageDropdown';

class Incoming extends React.Component {
    constructor (props) {
        super(props);
        const { model } = props;
        this.state = { selectedModel: model || {} };
    }

    linkRender = () => {
        console.log('link rendered');
    };

    handleLanguageChange = (value) => {
        const { models, projectId } = this.props;
        const { selectedModel } = this.state;

        const modelMatch = models.find(({ language }) => language === value);
        console.log(modelMatch);
        if (modelMatch) {
            this.setState({ selectedModel: modelMatch }, browserHistory.push({ pathname: `/project/${projectId}/incoming/model/${modelMatch._id}` }));
        }
    }

    // renderConversationBrowser = () => {}

    renderPanes = () => {
        const panes = [
            { menuItem: 'Incoming', render: () => <Tab.Pane>Incoming data</Tab.Pane> },
            { menuItem: 'Conversations', render: () => <Tab.Pane>Conversations</Tab.Pane> },
            { menuItem: 'Out of Scope', render: () => <Tab.Pane>Out of Scope data</Tab.Pane> },
            { menuItem: 'Populate', render: () => <Tab.Pane>Populate data</Tab.Pane> },
        ];
        return panes;
    }

    render () {
        const { projectLanguages, ready, instance, entities, intents, modelId, project, model } = this.props;
        const { selectedModel } = this.state;

        if (!ready || !model) {
            return <div>loading</div>;
        }
        console.log(model);
        return (
            <>
                <Menu pointing secondary className='top-menu'>
                    <Menu.Item header className='top-menu-item'>
                        <LanguageDropdown
                            languageOptions={projectLanguages}
                            selectedLanguage={selectedModel.language}
                            handleLanguageChange={this.handleLanguageChange}
                        />
                    </Menu.Item>
                </Menu>
                <>
                    <Container>
                        <Activity project={project} modelId={modelId} entities={entities} intents={intents} linkRender={this.linkRender} instance={instance} />
                    </Container>
                    
                </>
            </>
        );
        // return (
        //     <>
        //         <Menu pointing secondary className='top-menu'>
        //             <Menu.Item header className='top-menu-item'>
        //                 <LanguageDropdown
        //                     languageOptions={projectLanguages}
        //                     selectedLanguage={selectedModel.language}
        //                     handleLanguageChange={this.handleLanguageChange}
        //                 />
        //             </Menu.Item>
        //         </Menu>
        //         <>
        //             <Container>
        //                 <Tab
        //                     panes={this.renderPanes()}
        //                     menu={{ secondary: true, pointing: true }}
        //                 />
        //             </Container>
        //             <Activity project={project} modelId={modelId} entities={entities} intents={intents} linkRender={this.linkRender} instance={instance} />
        //         </>
        //     </>
        // );
    }
}

Incoming.propTypes = {
    projectLanguages: PropTypes.array,
    projectId: PropTypes.string,
    project: PropTypes.object.isRequired,
    ready: PropTypes.bool,
    model: PropTypes.object.isRequired,
    models: PropTypes.array.isRequired,
    utterances: PropTypes.array.isRequired,
    entities: PropTypes.array.isRequired,
    intents: PropTypes.array.isRequired,
    instances: PropTypes.array.isRequired,
    instance: PropTypes.object.isRequired,
    linkRender: PropTypes.func.isRequired,
    outDatedUtteranceIds: PropTypes.array.isRequired,
    modelId: PropTypes.string.isRequired,
};

Incoming.defaultProps = {
    projectLanguages: [],
    // projectId: '',
    ready: false,
};

const handleDefaultRoute = (projectId) => {
    const { nlu_models: modelIds = [], defaultLanguage } = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1, defaultLanguage: 1 } }) || {};
    const models = NLUModels.find({ _id: { $in: modelIds } }, { sort: { language: 1 } }).fetch();

    try {
        const defaultModelId = models.find(model => model.language === defaultLanguage)._id;
        browserHistory.push({ pathname: `/project/${projectId}/incoming/model/${defaultModelId}` });
    } catch (e) {
        browserHistory.push({ pathname: `/project/${projectId}/incoming/model/${modelIds[0]}` });
    }
};

const IncomingContainer = withTracker((props) => {
    const { params: { model_id: modelId, project_id: projectId } = {} } = props;

    let modelHandler = {
        ready() {
            return false;
        },
    };
    if (modelId) {
        modelHandler = Meteor.subscribe('nlu_models', modelId);
    }
    
    const instancesHandler = Meteor.subscribe('nlu_instances', projectId);
    const project = Projects.findOne({ _id: projectId }) || {};
    const projectLanguages = getNluModelLanguages(project.nlu_models, true);
    const instances = Instances.find({ projectId }).fetch();
    const instance = instances ? instances.find(({ _id }) => _id === project.instance) : {};

    const model = NLUModels.findOne({ _id: modelId });
    const models = NLUModels.find({ _id: { $in: project.nlu_models }, published: true }, { sort: { language: 1 } }, { fields: { language: 1, _id: 1 } }).fetch();

    if (!modelId || !project.nlu_models.includes(modelId)) {
        handleDefaultRoute(projectId);
    }

    if (!model) {
        console.log('no model');
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
        ready: !!projectLanguages && !!instances && instancesHandler.ready() && modelHandler.ready(),
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
