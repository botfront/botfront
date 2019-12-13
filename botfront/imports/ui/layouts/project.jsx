import { withTracker } from 'meteor/react-meteor-data';
import 'react-s-alert/dist/s-alert-default.css';
import { browserHistory } from 'react-router';
import windowSize from 'react-window-size';
import SplitPane from 'react-split-pane';
import { Meteor } from 'meteor/meteor';
import Intercom from 'react-intercom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Alert from 'react-s-alert';
import yaml from 'js-yaml';
import React from 'react';
import {
    Placeholder, Header, Menu, Container, Button, Loader, Popup,
} from 'semantic-ui-react';
import { Query } from '@apollo/react-components';
import { wrapMeteorCallback } from '../components/utils/Errors';
import ProjectSidebarComponent from '../components/project/ProjectSidebar';
import { Projects } from '../../api/project/project.collection';
import { setProjectId, setWorkingLanguage } from '../store/actions/actions';
import { Credentials } from '../../api/credentials';
import { Instances } from '../../api/instances/instances.collection';
import { Slots } from '../../api/slots/slots.collection';
import 'semantic-ui-css/semantic.min.css';
import store from '../store/store';
import { ProjectContext } from './context';
import { setsAreIdentical } from '../../lib/utils';
import { getNluModelLanguages } from '../../api/nlu_model/nlu_model.utils';
import { GET_BOT_RESPONSES, GET_BOT_RESPONSE } from './graphQL/queries';
import {
    CREATE_BOT_RESPONSE,
    UPDATE_BOT_RESPONSE,
} from './graphQL/mutations';
import {
    RESPONSE_ADDED,
} from './graphQL/subscriptions';
import apolloClient from '../../startup/client/apollo';


const ProjectChat = React.lazy(() => import('../components/project/ProjectChat'));

class Project extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showIntercom: false,
            intercomId: '',
            showChatPane: false,
            resizingChatPane: false,
            entities: [],
            intents: [],
            exampleMap: {},
        };
    }


    componentDidUpdate = (prevProps) => {
        const { projectId, workingLanguage: language } = this.props;
        const { projectId: prevProjectId, workingLanguage: prevLanguage } = prevProps;
        const { showIntercom } = this.state;
        if (window.Intercom && showIntercom) {
            window.Intercom('show');
            window.Intercom('update', {
                hide_default_launcher: true,
            });
            window.Intercom('onHide', () => {
                this.setState({ showIntercom: false });
            });
        }
        if ((language && prevLanguage !== language)
            || (projectId && prevProjectId !== projectId)) {
            this.refreshEntitiesAndIntents(true);
        }
    }

    findExactMatch = (canonicals, entities) => {
        const exactMatch = canonicals.filter(ex => setsAreIdentical(ex.entities, entities))[0];
        return exactMatch ? exactMatch.example : null;
    }

    getCanonicalExamples = ({ intent, entities = [] }) => {
        // both intent and entities are optional and serve to restrict the result
        const { exampleMap } = this.state;
        const filtered = intent
            ? intent in exampleMap ? { [intent]: exampleMap[intent] } : {}
            : exampleMap;
        return Object.keys(filtered)
            .map(i => this.findExactMatch(filtered[i], entities.map(e => e.entity)) || { intent: i });
    }

    refreshEntitiesAndIntents = (init = false) => {
        const { projectId, workingLanguage: language } = this.props;
        const { exampleMap } = this.state;

        if (!projectId || !language) return; // don't call unless projectId and language are set
        if (!init && !exampleMap) return; // unless called from this class, call only if already init
        Meteor.call(
            'project.getEntitiesAndIntents',
            projectId,
            language,
            wrapMeteorCallback((err, res) => {
                if (!err) {
                    this.setState({ entities: res.entities });
                    this.setState({ intents: Object.keys(res.intents) });
                    this.setState({ exampleMap: res.intents });
                }
            }),
        );
    }

    getIntercomUser = () => {
        const { _id, emails, profile } = Meteor.user();
        return {
            user_id: _id,
            email: emails[0].address,
            name: profile.firstName,
        };
    };

    getUtteranceFromPayload = (payload, callback = () => { }) => {
        const { projectId, workingLanguage } = this.props;
        Meteor.call(
            'nlu.getUtteranceFromPayload',
            projectId,
            payload,
            workingLanguage,
            (err, res) => callback(err, res),
        );
    }


    handleTriggerIntercom = (id) => {
        this.setState({
            intercomId: id,
            showIntercom: true,
        });
    };

    handleChangeProject = (projectId) => {
        const { router: { replace, location: { pathname } } = {} } = this.props;
        replace(pathname.replace(/\/project\/.*?\//, `/project/${projectId}/`));
    };

    triggerChatPane = () => {
        this.setState(state => ({
            showChatPane: !state.showChatPane,
        }));
    };

    parseUtterance = (utterance) => {
        const { instance, workingLanguage } = this.props;
        return Meteor.callWithPromise(
            'rasa.parse',
            instance,
            [{ text: utterance, lang: workingLanguage }],
        );
    }

    addIntent = (newIntent) => {
        const { intents, exampleMap } = this.state;
        this.setState({ intents: [...new Set([...intents, newIntent])] });
        if (!Object.keys(exampleMap).includes(newIntent)) {
            this.setState({ exampleMap: { ...exampleMap, [newIntent]: [] } });
        }
    }

    addEntity = (newEntity) => {
        const { entities } = this.state;
        this.setState({ entities: [...new Set([...entities, newEntity])] });
    }

    updateResponse = () => {
        const { projectId } = this.props;
        return (newResponse, callback = () => { }) => {
            const omitTypename = (key, value) => (key === '__typename' ? undefined : value);
            const cleanedResponse = JSON.parse(JSON.stringify(newResponse), omitTypename);
            apolloClient.mutate({
                mutation: UPDATE_BOT_RESPONSE,
                variables: { projectId, response: cleanedResponse, _id: newResponse._id },
            }).then(
                (result) => {
                    callback(undefined, result);
                },
                (error) => {
                    callback(error);
                },
            );
        };
    }


    insertResponse = () => {
        const { projectId } = this.props;
        return (newResponse, callback = () => { }) => {
            // onCompleted and onError seems to have issues currently https://github.com/apollographql/react-apollo/issues/2293
            apolloClient.mutate({
                mutation: CREATE_BOT_RESPONSE,
                variables: { projectId, response: newResponse },
            }).then(
                (result) => {
                    callback(undefined, result);
                },
                (error) => {
                    callback(error);
                },
            );
        };
    }


    getResponse = () => {
        const { projectId, workingLanguage } = this.props;
        return (key, callback = () => { }) => {
            apolloClient.query({
                query: GET_BOT_RESPONSE,
                variables: {
                    projectId,
                    key,
                    lang: workingLanguage || 'en',
                },
            }).then(
                (result) => {
                    callback(undefined, result.data.botResponse);
                },
                (error) => {
                    callback(error);
                },
            );
        };
    }

    addUtteranceToTrainingData = (utterance, callback = () => { }) => {
        const { projectId, workingLanguage } = this.props;
        Meteor.call(
            'nlu.insertExamplesWithLanguage',
            projectId,
            workingLanguage,
            [utterance],
            wrapMeteorCallback((err, res) => callback(err, res)),
        );
    }

    renderPlaceholder = (inverted, fluid) => (
        <Placeholder fluid={fluid} inverted={inverted} className='sidebar-placeholder'>
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
    );

    render() {
        const {
            children,
            projectId,
            loading,
            channel,
            renderLegacyModels,
            project,
            workingLanguage,
            slots,
        } = this.props;
        const {
            showIntercom, intercomId, showChatPane, resizingChatPane, intents, entities,
        } = this.state;

        return (
            <div style={{ height: '100vh' }}>
                {showIntercom && !loading && <Intercom appID={intercomId} {...this.getIntercomUser()} />}
                <div className='project-sidebar'>
                    <Header as='h1' className='logo'>
                        Botfront.
                    </Header>
                    <Header as='h1' className='simple-logo'>
                        B.
                    </Header>
                    {loading && this.renderPlaceholder(true, false)}
                    {!loading && (
                        <ProjectSidebarComponent
                            projectId={projectId}
                            handleChangeProject={this.handleChangeProject}
                            triggerIntercom={this.handleTriggerIntercom}
                            renderLegacyModels={renderLegacyModels}
                        />
                    )}
                </div>
                <div className='project-children'>
                    <SplitPane
                        split='vertical'
                        minSize={showChatPane ? 300 : 0}
                        defaultSize={showChatPane ? 300 : 0}
                        maxSize={showChatPane ? 600 : 0}
                        primary='second'
                        allowResize={showChatPane}
                        className={resizingChatPane ? '' : 'width-transition'}
                        onDragStarted={() => this.setState({ resizingChatPane: true })}
                        onDragFinished={() => this.setState({ resizingChatPane: false })}
                    >
                        {loading && (
                            <div>
                                <Menu pointing secondary style={{ background: '#fff' }} />
                                <Container className='content-placeholder'>{this.renderPlaceholder(false, true)}</Container>
                            </div>
                        )}
                        {!loading && (
                            <Query query={GET_BOT_RESPONSES} variables={{ projectId }}>
                                {({ loadingResponses, data, subscribeToMore }) => (
                                    <ProjectContext.Provider
                                        value={{
                                            templates: data && !loadingResponses ? data.botResponses : [],
                                            intents,
                                            entities,
                                            slots,
                                            language: workingLanguage,
                                            insertResponse: this.insertResponse(),
                                            updateResponse: this.updateResponse(),
                                            getResponse: this.getResponse(),
                                            addEntity: this.addEntity,
                                            addIntent: this.addIntent,
                                            getUtteranceFromPayload: this.getUtteranceFromPayload,
                                            parseUtterance: this.parseUtterance,
                                            addUtteranceToTrainingData: this.addUtteranceToTrainingData,
                                            getCanonicalExamples: this.getCanonicalExamples,
                                            refreshEntitiesAndIntents: this.refreshEntitiesAndIntents,
                                            subscribeToNewBotResponses: () => subscribeToMore({
                                                document: RESPONSE_ADDED,
                                                variables: { projectId },
                                                updateQuery: (prev, { subscriptionData }) => {
                                                    if (!subscriptionData.data) return prev;
                                                    const newBotResponse = subscriptionData.data.botResponseAdded;
                                                    return { prev, botResponses: [...prev.botResponses, newBotResponse] };
                                                },
                                            }),
                                        }}
                                    >
                                        <div data-cy='left-pane'>
                                            {children}
                                            {!showChatPane && channel && (
                                                <Popup
                                                    trigger={<Button size='big' circular onClick={this.triggerChatPane} icon='comment' primary className='open-chat-button' data-cy='open-chat' />}
                                                    content='Try out your chatbot'
                                                />
                                            )}
                                        </div>
                                    </ProjectContext.Provider>
                                )}
                            </Query>
                        )}
                        {!loading && showChatPane && (
                            <React.Suspense fallback={<Loader active />}>
                                <ProjectChat channel={channel} triggerChatPane={this.triggerChatPane} projectId={projectId} />
                            </React.Suspense>
                        )}
                    </SplitPane>
                </div>
                <Alert stack={{ limit: 3 }} />
            </div>
        );
    }
}

Project.propTypes = {
    router: PropTypes.object.isRequired,
    windowHeight: PropTypes.number.isRequired,
    project: PropTypes.object,
    projectId: PropTypes.string.isRequired,
    instance: PropTypes.object,
    workingLanguage: PropTypes.string,
    slots: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    channel: PropTypes.object,
};

Project.defaultProps = {
    channel: null,
    project: {},
    instance: {},
    workingLanguage: 'en',
};

const ProjectContainer = withTracker((props) => {
    const {
        params: { project_id: projectId }, projectId: storeProjectId, changeWorkingLanguage, changeProjectId,
    } = props;
    let projectHandler = null;
    let renderLegacyModels;
    if (!projectId) return browserHistory.replace({ pathname: '/404' });
    projectHandler = Meteor.subscribe('projects', projectId);
    const nluModelsHandler = Meteor.subscribe('nlu_models.lite');
    const credentialsHandler = Meteor.subscribe('credentials', projectId);
    const introStoryGroupIdHandler = Meteor.subscribe('introStoryGroup', projectId);
    const instanceHandler = Meteor.subscribe('nlu_instances', projectId);
    const slotsHandler = Meteor.subscribe('slots', projectId);
    const instance = Instances.findOne({ projectId });
    const readyHandler = handler => (handler);
    const readyHandlerList = [
        Meteor.user(),
        credentialsHandler.ready(),
        projectHandler ? projectHandler.ready() && nluModelsHandler.ready() : nluModelsHandler.ready(),
        introStoryGroupIdHandler.ready(),
        instanceHandler.ready(),
        slotsHandler.ready(),
    ];
    const ready = readyHandlerList.every(readyHandler);
    const project = Projects.findOne({ _id: projectId });
    const { defaultLanguage } = project || {};

    if (ready && !project) {
        return browserHistory.replace({ pathname: '/404' });
    }

    if (project) {
        const nluModelLanguages = getNluModelLanguages(project.nlu_models, true);
        renderLegacyModels = project.nlu_models.length !== nluModelLanguages.length;
    }

    let channel = null;
    if (ready) {
        let credentials = Credentials.findOne({ $or: [{ projectId, environment: { $exists: false } }, { projectId, environment: 'development' }] });
        credentials = credentials && yaml.safeLoad(credentials.credentials);
        channel = credentials['rasa_addons.core.channels.webchat.WebchatInput'];
    }

    // update store if new projectId
    if (storeProjectId !== projectId) {
        changeProjectId(projectId);
    }

    // update working language
    if (!store.getState().settings.get('workingLanguage') && defaultLanguage) {
        changeWorkingLanguage(defaultLanguage);
    }

    return {
        loading: !ready,
        project,
        projectId,
        channel,
        instance,
        slots: Slots.find({}).fetch(),
        renderLegacyModels,
    };
})(windowSize(Project));

const mapStateToProps = state => ({
    workingLanguage: state.settings.get('workingLanguage'),
    projectId: state.settings.get('projectId'),
});

const mapDispatchToProps = {
    changeWorkingLanguage: setWorkingLanguage,
    changeProjectId: setProjectId,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ProjectContainer);

export function WithRefreshOnLoad(Component) {
    return props => (
        <ProjectContext.Consumer>
            {({ refreshEntitiesAndIntents }) => <Component {...props} onLoad={refreshEntitiesAndIntents} />}
        </ProjectContext.Consumer>
    );
}
