import { withTracker } from 'meteor/react-meteor-data';
import 'react-s-alert/dist/s-alert-default.css';
import { browserHistory } from 'react-router';
import SplitPane from 'react-split-pane';
import { Meteor } from 'meteor/meteor';
import Intercom from 'react-intercom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import Alert from 'react-s-alert';
import yaml from 'js-yaml';
import React from 'react';
import {
    Placeholder, Header, Menu, Container, Button, Loader, Popup,
} from 'semantic-ui-react';
import gql from 'graphql-tag';
import { wrapMeteorCallback } from '../components/utils/Errors';
import ProjectSidebarComponent from '../components/project/ProjectSidebar';
import { Projects } from '../../api/project/project.collection';
import { getNluModelLanguages } from '../../api/nlu_model/nlu_model.utils';
import { setProjectId, setWorkingLanguage, setShowChat } from '../store/actions/actions';
import { Credentials } from '../../api/credentials';
import { Instances } from '../../api/instances/instances.collection';
import { Slots } from '../../api/slots/slots.collection';
import 'semantic-ui-css/semantic.min.css';
import store from '../store/store';
import { ProjectContext } from './context';
import { setsAreIdentical } from '../../lib/utils';
import {
    GET_BOT_RESPONSES,
    UPSERT_BOT_RESPONSE,
} from './graphql';
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
            responses: {},
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

    triggerChatPane = (value) => {
        this.setState(state => ({
            showChatPane: value === true || value === false ? value : !state.showChatPane,
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

    upsertResponse = async (key, newResponse, index) => {
        const { responses } = this.state;
        const { isNew: isNewResponse, payload, key: newKey } = newResponse;
        const { projectId, workingLanguage: language } = this.props;
        const newPayload = payload; // don't pass isNew to mutation
        let responseTypeVariable = {};
        // if the response type has changed; add newResponseType to the queryVariables
        if (responses[key] && responses[key].__typename !== payload.__typename) {
            responseTypeVariable = { newResponseType: payload.__typename };
            this.resetResponseInCache(key);
        }
        if (newKey) {
            this.resetResponseInCache(newKey);
        }
        const variables = {
            projectId, language, newPayload, key, newKey, index, ...responseTypeVariable,
        };

        const result = await apolloClient.mutate({
            mutation: UPSERT_BOT_RESPONSE,
            variables,
            update: () => this.setResponse(newKey || key, { ...newPayload, isNew: isNewResponse }),
        });
        return result;
    }

    responsesFrag = () => {
        const { projectId, workingLanguage } = this.props;
        return {
            id: `${projectId}-${workingLanguage}`,
            fragment: gql`
                fragment C on Cached {
                    responses
                }
            `,
        };
    }

    getMultiLangResponsesFrag = async () => {
        const { projectId, projectLanguages } = this.props;
        return projectLanguages.map(({ value }) => ({
            id: `${projectId}-${value}`,
            fragment: gql`
                    fragment C on Cached {
                        responses
                    }
                `,
        }));
    };

    resetResponseInCache = async (responseName) => {
        const frags = await this.getMultiLangResponsesFrag();
        const fragKeys = Object.keys(frags);
        const readFrags = fragKeys.map(key => apolloClient.readFragment(frags[key]) || { responses: {} });
        readFrags.forEach((frag, i) => {
            const fragResponses = { ...frag.responses };
            delete fragResponses[responseName];
            const newFrag = {
                ...frags[fragKeys[i]],
                data: {
                    responses: fragResponses,
                    __typename: 'Cached',
                },
            };
            apolloClient.writeFragment(newFrag);
        });
    }

    readResponsesFrag = () => apolloClient.readFragment(this.responsesFrag()) || { responses: {} };

    writeResponsesFrag = (responses) => {
        const newResponses = {
            ...this.responsesFrag(),
            data: {
                responses,
                __typename: 'Cached',
            },
        };
        apolloClient.writeFragment(newResponses);
        this.setState({ responses });
    }

    setResponse = async (template, content) => {
        const { responses } = await this.readResponsesFrag();
        return this.writeResponsesFrag({ ...responses, [template]: content });
    }

    setResponses = async (data = {}) => {
        const { responses } = await this.readResponsesFrag();
        return this.writeResponsesFrag({ ...responses, ...data });
    }

    addResponses = async (templates) => {
        const { projectId, workingLanguage } = this.props;
        const { responses } = await this.readResponsesFrag();
        const newTemplates = templates.filter(r => !(Object.keys(responses).includes(r)));
        if (!newTemplates.length) return this.setState({ responses });
        const result = await apolloClient.query({
            query: GET_BOT_RESPONSES,
            variables: {
                templates: newTemplates,
                projectId,
                language: workingLanguage,
            },
        });
        if (!result.data) return this.setState({ responses });
        await this.setResponses(
            result.data.getResponses.reduce( // turns [{ k: k1, v1, v2 }, { k: k2, v1, v2 }] into { k1: { v1, v2 }, k2: { v1, v2 } }
                (acc, { key, ...rest }) => ({ ...acc, ...(key in acc ? {} : { [key]: rest }) }), {},
            ),
        );
        return Date.now();
    }

    addUtterancesToTrainingData = (utterances, callback = () => { }) => {
        const { projectId, workingLanguage } = this.props;
        Meteor.call(
            'nlu.insertExamplesWithLanguage',
            projectId,
            workingLanguage,
            utterances.filter(u => u.text),
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

    render = () => {
        const {
            children,
            projectId,
            loading,
            channel,
            project,
            instance,
            workingLanguage,
            projectLanguages,
            slots,
            showChat,
            changeShowChat,
        } = this.props;
        const {
            showIntercom, intercomId, resizingChatPane, intents, entities, responses,
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
                        />
                    )}
                </div>
                <div className='project-children'>
                    <SplitPane
                        split='vertical'
                        minSize={showChat ? 300 : 0}
                        defaultSize={showChat ? 300 : 0}
                        maxSize={showChat ? 600 : 0}
                        primary='second'
                        allowResize={showChat}
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
                            <ProjectContext.Provider
                                value={{
                                    project,
                                    instance,
                                    projectLanguages,
                                    intents,
                                    entities,
                                    slots,
                                    language: workingLanguage,
                                    otherLanguages: projectLanguages.filter(lang => lang.value !== workingLanguage),
                                    triggerChatPane: this.triggerChatPane,
                                    upsertResponse: this.upsertResponse,
                                    responses,
                                    addResponses: this.addResponses,
                                    addEntity: this.addEntity,
                                    addIntent: this.addIntent,
                                    getUtteranceFromPayload: this.getUtteranceFromPayload,
                                    parseUtterance: this.parseUtterance,
                                    addUtterancesToTrainingData: this.addUtterancesToTrainingData,
                                    getCanonicalExamples: this.getCanonicalExamples,
                                    refreshEntitiesAndIntents: this.refreshEntitiesAndIntents,
                                    resetResponseInCache: this.resetResponseInCache,
                                    setResponseInCache: this.setResponse,
                                }}
                            >
                                <DndProvider backend={HTML5Backend}>
                                    <div data-cy='left-pane'>
                                        {children}
                                        {!showChat && channel && (
                                            <Popup
                                                trigger={
                                                    <Button size='big' circular onClick={() => changeShowChat(!showChat)} icon='comment' primary className='open-chat-button' data-cy='open-chat' />
                                                }
                                                content='Try out your chatbot'
                                            />
                                        )}
                                    </div>
                                </DndProvider>
                            </ProjectContext.Provider>
                        )}
                        {!loading && showChat && (
                            <React.Suspense fallback={<Loader active />}>
                                <ProjectChat channel={channel} triggerChatPane={() => changeShowChat(!showChat)} projectId={projectId} />
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
    children: PropTypes.any.isRequired,
    router: PropTypes.object.isRequired,
    project: PropTypes.object,
    projectId: PropTypes.string.isRequired,
    instance: PropTypes.object,
    workingLanguage: PropTypes.string,
    projectLanguages: PropTypes.array.isRequired,
    slots: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    channel: PropTypes.object,
    showChat: PropTypes.bool.isRequired,
    changeShowChat: PropTypes.func.isRequired,
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
    if (!projectId) return browserHistory.replace({ pathname: '/404' });
    const projectHandler = Meteor.subscribe('projects', projectId);
    const nluModelsHandler = Meteor.subscribe('nlu_models.lite');
    const credentialsHandler = Meteor.subscribe('credentials', projectId);
    const instanceHandler = Meteor.subscribe('nlu_instances', projectId);
    const slotsHandler = Meteor.subscribe('slots', projectId);
    const instance = Instances.findOne({ projectId });
    const readyHandler = handler => (handler);
    const readyHandlerList = [
        Meteor.user(),
        credentialsHandler.ready(),
        projectHandler.ready(),
        nluModelsHandler.ready(),
        instanceHandler.ready(),
        slotsHandler.ready(),
    ];
    const ready = readyHandlerList.every(readyHandler);
    const project = Projects.findOne({ _id: projectId });
    const { defaultLanguage } = project || {};

    if (ready && !project) {
        return browserHistory.replace({ pathname: '/404' });
    }

    let channel = null;
    if (ready) {
        let credentials = Credentials.findOne({ $or: [{ projectId, environment: { $exists: false } }, { projectId, environment: 'development' }] });
        credentials = credentials ? yaml.safeLoad(credentials.credentials) : {};
        channel = credentials['rasa_addons.core.channels.webchat.WebchatInput'];
    }

    // update store if new projectId
    if (storeProjectId !== projectId) {
        changeProjectId(projectId);
    }

    const projectLanguages = ready ? getNluModelLanguages(project.nlu_models, true) : [];

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
        projectLanguages,
    };
})(Project);

const mapStateToProps = state => ({
    workingLanguage: state.settings.get('workingLanguage'),
    projectId: state.settings.get('projectId'),
    showChat: state.settings.get('showChat'),
});

const mapDispatchToProps = {
    changeWorkingLanguage: setWorkingLanguage,
    changeProjectId: setProjectId,
    changeShowChat: setShowChat,
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
