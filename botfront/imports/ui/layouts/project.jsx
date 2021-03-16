import { withTracker } from 'meteor/react-meteor-data';
import 'react-s-alert/dist/s-alert-default.css';
import { browserHistory } from 'react-router';
import SplitPane from 'react-split-pane';
import { Meteor } from 'meteor/meteor';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import Alert from 'react-s-alert';
import yaml from 'js-yaml';
import React, { useState, useEffect } from 'react';
import {
    Placeholder,
    Header,
    Menu,
    Container,
    Button,
    Loader,
    Popup,
    Image,
} from 'semantic-ui-react';
import { useIntentAndEntityList } from '../components/nlu/models/hooks';
import { wrapMeteorCallback } from '../components/utils/Errors';
import ProjectSidebarComponent from '../components/project/ProjectSidebar';
import { Projects } from '../../api/project/project.collection';
import { languages as languageOptions } from '../../lib/languages';
import { setProjectId, setWorkingLanguage, setShowChat } from '../store/actions/actions';
import { Credentials } from '../../api/credentials';
import { NLUModels } from '../../api/nlu_model/nlu_model.collection';
import { Instances } from '../../api/instances/instances.collection';
import { Slots } from '../../api/slots/slots.collection';
import { Stories } from '../../api/story/stories.collection';
import 'semantic-ui-css/semantic.min.css';
import { GlobalSettings } from '../../api/globalSettings/globalSettings.collection';
import { ProjectContext } from './context';
import { setsAreIdentical, cleanDucklingFromExamples } from '../../lib/utils';
import { INSERT_EXAMPLES } from '../components/nlu/models/graphql';
import apolloClient from '../../startup/client/apollo';
import { useResponsesContext } from './response.hooks';
import { can } from '../../lib/scopes';

const ProjectChat = React.lazy(() => import('../components/project/ProjectChat'));

function Project(props) {
    const {
        project,
        projectId,
        loading,
        workingLanguage,
        workingDeploymentEnvironment,
        projectLanguages,
        router: { replace, location: { pathname } } = {},
        showChat,
        changeShowChat,
        instance,
        slots,
        dialogueActions,
        channel,
        children,
        settings,
        allowContextualQuestions,
        hasNoWhitespace,
    } = props;
    const [resizingChatPane, setResizingChatPane] = useState(false);
    const [requestedSlot, setRequestedSlot] = useState(null);
    const {
        intents: intentsList = {},
        entities: entitiesList = [],
        refetch: refreshEntitiesAndIntents,
    } = useIntentAndEntityList({ projectId, language: workingLanguage || '' });
    const {
        responses,
        addResponses,
        upsertResponse,
        resetResponseInCache,
        setResponseInCache,
    } = useResponsesContext({ projectId, workingLanguage, projectLanguages });

    useEffect(() => {
        if (refreshEntitiesAndIntents) {
            refreshEntitiesAndIntents();
        }
    }, [workingLanguage, projectId]);

    useEffect(() => () => {
        Meteor.call(
            'project.getContextualSlot',
            projectId,
            wrapMeteorCallback((err, res) => {
                setRequestedSlot(res);
            }),
        );
    }, [allowContextualQuestions]);

    const findExactMatch = (canonicals, entities) => {
        const exactMatch = canonicals.filter(ex => setsAreIdentical(
            ex.entities.map(e => `${e.entity}:${e.value}`),
            entities.map(e => `${e.entity}:${e.value}`),
        ))[0];
        return exactMatch ? exactMatch.example : null;
    };

    const getCanonicalExamples = ({ intent, entities = [] }) => {
        // both intent and entities are optional and serve to restrict the result
        const filtered = intent
            ? intent in intentsList
                ? { [intent]: intentsList[intent] }
                : {}
            : intentsList;
        return Object.keys(filtered).map(
            i => findExactMatch(filtered[i], entities),
        ).filter(ex => ex);
    };

    const parseUtterance = utterance => Meteor.callWithPromise('rasa.parse', instance, [
        { text: utterance, lang: workingLanguage },
    ]);

    const addUtterancesToTrainingData = (utterances, callback = () => {}) => {
        if (!(utterances || []).filter(u => u.text).length) { callback(null, { success: true }); }
        const cleanedUtterances = cleanDucklingFromExamples(utterances);
        apolloClient
            .mutate({
                mutation: INSERT_EXAMPLES,
                variables: {
                    examples: cleanedUtterances.filter(u => u.text),
                    projectId,
                    language: workingLanguage,
                },
            })
            .then(
                res => wrapMeteorCallback(callback)(null, res),
                wrapMeteorCallback(callback),
            );
    };

    const renderPlaceholder = (inverted, fluid) => (
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

    return (
        <div style={{ height: '100vh' }}>
            <div className='project-sidebar'>
                {(settings && settings.settings && settings.settings.public && settings.settings.public.logoUrl) || project.logoUrl ? (
                    <Header as='h1' className='logo'>
                        <Image src={!loading ? project.logoUrl || settings.settings.public.logoUrl : ''} centered className='custom-logo' />
                    </Header>
                ) : (
                    <Header as='h1' className='logo'>
                        Botfront.
                    </Header>
                )}
                {(settings && settings.settings && settings.settings.public && settings.settings.public.smallLogoUrl) || project.smallLogoUrl ? (
                    <Header as='h1' className='simple-logo'>
                        <Image src={!loading ? project.smallLogoUrl || settings.settings.public.smallLogoUrl : ''} centered className='custom-small-logo' />
                    </Header>
                ) : (
                    <Header as='h1' className='simple-logo'>
                        B.
                    </Header>
                )}
                {loading && renderPlaceholder(true, false)}
                {!loading && (
                    <ProjectSidebarComponent
                        projectId={projectId}
                        handleChangeProject={pid => replace(
                            pathname.replace(/\/project\/.*?\//, `/project/${pid}/`),
                        )
                        }
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
                    onDragStarted={() => setResizingChatPane(true)}
                    onDragFinished={() => setResizingChatPane(false)}
                >
                    {loading && (
                        <div>
                            <Menu pointing secondary style={{ background: '#fff' }} />
                            <Container className='content-placeholder'>
                                {renderPlaceholder(false, true)}
                            </Container>
                        </div>
                    )}
                    {!loading && (
                        <ProjectContext.Provider
                            value={{
                                project,
                                instance,
                                projectLanguages,
                                intents: Object.keys(intentsList || {}),
                                entities: entitiesList || [],
                                slots,
                                dialogueActions,
                                language: workingLanguage,
                                environment: workingDeploymentEnvironment,
                                upsertResponse,
                                responses,
                                addResponses,
                                refreshEntitiesAndIntents,
                                parseUtterance,
                                addUtterancesToTrainingData,
                                getCanonicalExamples,
                                resetResponseInCache,
                                setResponseInCache,
                                requestedSlot,
                                hasNoWhitespace,
                            }}
                        >
                            <DndProvider backend={HTML5Backend}>
                                <div data-cy='left-pane'>
                                    {children}
                                    {!showChat && channel && (
                                        <Popup
                                            trigger={(
                                                <Button
                                                    size='big'
                                                    circular
                                                    onClick={() => changeShowChat(!showChat)}
                                                    icon='comment'
                                                    primary
                                                    className='open-chat-button'
                                                    data-cy='open-chat'
                                                />
                                            )}
                                            content='Try out your chatbot'
                                        />
                                    )}
                                </div>
                            </DndProvider>
                        </ProjectContext.Provider>
                    )}
                    {!loading && showChat && (
                        <React.Suspense fallback={<Loader active />}>
                            <ProjectChat
                                channel={channel}
                                triggerChatPane={() => changeShowChat(!showChat)}
                                project={project}
                            />
                        </React.Suspense>
                    )}
                </SplitPane>
            </div>
            <Alert stack={{ limit: 3 }} html={true} />
        </div>
    );
}

Project.propTypes = {
    children: PropTypes.any.isRequired,
    router: PropTypes.object.isRequired,
    project: PropTypes.object,
    projectId: PropTypes.string.isRequired,
    instance: PropTypes.object,
    workingLanguage: PropTypes.string,
    workingDeploymentEnvironment: PropTypes.string,
    projectLanguages: PropTypes.array.isRequired,
    slots: PropTypes.array.isRequired,
    dialogueActions: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    channel: PropTypes.object,
    settings: PropTypes.object,
    showChat: PropTypes.bool.isRequired,
    changeShowChat: PropTypes.func.isRequired,
    allowContextualQuestions: PropTypes.bool,
    hasNoWhitespace: PropTypes.bool,
};

Project.defaultProps = {
    channel: null,
    settings: {},
    project: {},
    instance: {},
    workingLanguage: 'en',
    workingDeploymentEnvironment: 'development',
    allowContextualQuestions: false,
    hasNoWhitespace: false,
};

const ProjectContainer = withTracker((props) => {
    const {
        params: { project_id: projectId },
        projectId: storeProjectId,
        workingLanguage,
        changeWorkingLanguage,
        changeProjectId,
        router,
    } = props;

    if (!Meteor.userId()) {
        router.push('/login');
    }

    if (!projectId) return browserHistory.replace({ pathname: '/404' });
    const projectHandler = Meteor.subscribe('projects', projectId);
    const credentialsHandler = Meteor.subscribe('credentials', projectId);
    const settingsHandler = Meteor.subscribe('settings', projectId);
    const settings = GlobalSettings.findOne({}, {
        fields: { 'settings.public.logoUrl': 1, 'settings.public.smallLogoUrl': 1 },
    });
    const instanceHandler = Meteor.subscribe('nlu_instances', projectId);
    const slotsHandler = Meteor.subscribe('slots', projectId);
    const allowContextualQuestionsHandler = Meteor.subscribe('project.requestedSlot', projectId);
    let nluModelsHandler = null;
    let hasNoWhitespace;
    if (can('nlu-data:r', projectId)) {
        nluModelsHandler = Meteor.subscribe('nlu_models', projectId, workingLanguage);
        ({ hasNoWhitespace } = NLUModels.findOne({ projectId, language: workingLanguage }, { fields: { hasNoWhitespace: 1 } }) || {});
    } else {
        hasNoWhitespace = false;
    }
    let storiesHandler = null;
    if (can('responses:r', projectId)) {
        storiesHandler = Meteor.subscribe('stories.events', projectId);
    }
    const dialogueActions = storiesHandler ? Array.from(new Set((Stories
        .find().fetch() || []).flatMap(story => story.events))) : [];
    const instance = Instances.findOne({ projectId });
    const readyHandler = handler => handler;
    const readyHandlerList = [
        Meteor.user(),
        credentialsHandler.ready(),
        projectHandler.ready(),
        settingsHandler.ready(),
        instanceHandler.ready(),
        slotsHandler.ready(),
        storiesHandler ? storiesHandler.ready() : true,
        allowContextualQuestionsHandler.ready(),
        nluModelsHandler ? nluModelsHandler.ready() : true,
    ];
    const ready = readyHandlerList.every(readyHandler);
    const project = Projects.findOne({ _id: projectId });
    const { defaultLanguage } = project || {};

    if (ready && !project) {
        return browserHistory.replace({ pathname: '/404' });
    }

    let channel = null;
    if (ready) {
        let credentials = Credentials.findOne({
            $or: [
                { projectId, environment: { $exists: false } },
                { projectId, environment: 'development' },
            ],
        });
        credentials = credentials ? yaml.safeLoad(credentials.credentials) : {};
        channel = credentials['rasa_addons.core.channels.webchat.WebchatInput'];
        if (!channel) {
            channel = credentials['rasa_addons.core.channels.webchat_plus.WebchatPlusInput'];
        }
    }

    // update store if new projectId
    if (storeProjectId !== projectId) {
        changeProjectId(projectId);
    }

    const projectLanguages = ready
        ? (project.languages || []).map(value => ({
            text: languageOptions[value].name,
            value,
        }))
        : [];

    // update working language
    if (
        ready
        && defaultLanguage
        && !projectLanguages.some(({ value }) => value === workingLanguage)
    ) {
        changeWorkingLanguage(defaultLanguage);
    }

    return {
        loading: !ready,
        project,
        projectId,
        channel,
        instance,
        slots: Slots.find({}).fetch(),
        dialogueActions,
        projectLanguages,
        settings,
        allowContextualQuestions: ready ? project.allowContextualQuestions : false,
        hasNoWhitespace,
    };
})(Project);

const mapStateToProps = state => ({
    workingLanguage: state.settings.get('workingLanguage'),
    workingDeploymentEnvironment: state.settings.get('workingDeploymentEnvironment'),
    projectId: state.settings.get('projectId'),
    showChat: state.settings.get('showChat'),
});

const mapDispatchToProps = {
    changeWorkingLanguage: setWorkingLanguage,
    changeProjectId: setProjectId,
    changeShowChat: setShowChat,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectContainer);
