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
import React, { useState, useEffect } from 'react';
import {
    Placeholder,
    Header,
    Menu,
    Container,
    Button,
    Loader,
    Popup,
} from 'semantic-ui-react';
import { useIntentAndEntityList } from '../components/nlu/models/hooks';
import { wrapMeteorCallback } from '../components/utils/Errors';
import ProjectSidebarComponent from '../components/project/ProjectSidebar';
import { Projects } from '../../api/project/project.collection';
import { languages as languageOptions } from '../../lib/languages';
import { setProjectId, setWorkingLanguage, setShowChat } from '../store/actions/actions';
import { Credentials } from '../../api/credentials';
import { Instances } from '../../api/instances/instances.collection';
import { Slots } from '../../api/slots/slots.collection';
import 'semantic-ui-css/semantic.min.css';
import { ProjectContext } from './context';
import { setsAreIdentical } from '../../lib/utils';
import { INSERT_EXAMPLES } from '../components/nlu/models/graphql';
import apolloClient from '../../startup/client/apollo';
import { useResponsesContext } from './response.hooks';

const ProjectChat = React.lazy(() => import('../components/project/ProjectChat'));

function Project(props) {
    const {
        project,
        projectId,
        loading,
        workingLanguage,
        projectLanguages,
        router: { replace, location: { pathname } } = {},
        showChat,
        changeShowChat,
        instance,
        slots,
        channel,
        children,
    } = props;
    const [showIntercom, setShowIntercom] = useState(false);
    const [intercomId, setIntercomId] = useState('');
    const [resizingChatPane, setResizingChatPane] = useState(false);
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
        if (window.Intercom) {
            window.Intercom('show');
            window.Intercom('update', {
                hide_default_launcher: true,
            });
            window.Intercom('onHide', () => {
                setShowIntercom(false);
            });
        }
    }, [!!window.Intercom]);

    useEffect(() => {
        if (refreshEntitiesAndIntents) {
            refreshEntitiesAndIntents();
        }
    }, [workingLanguage, projectId]);

    const findExactMatch = (canonicals, entities) => {
        const exactMatch = canonicals.filter(ex => setsAreIdentical(ex.entities, entities))[0];
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
            i => findExactMatch(
                filtered[i],
                entities.map(e => e.entity),
            ) || { intent: i },
        );
    };

    const getIntercomUser = () => {
        const { _id, emails, profile } = Meteor.user();
        return {
            user_id: _id,
            email: emails[0].address,
            name: profile.firstName,
        };
    };

    const parseUtterance = utterance => Meteor.callWithPromise('rasa.parse', instance, [
        { text: utterance, lang: workingLanguage },
    ]);

    const addUtterancesToTrainingData = (utterances, callback = () => {}) => {
        if (!(utterances || []).filter(u => u.text).length) callback(null, { success: true });
        apolloClient
            .mutate({
                mutation: INSERT_EXAMPLES,
                variables: {
                    examples: utterances.filter(u => u.text),
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
            {showIntercom && !loading && (
                <Intercom appID={intercomId} {...getIntercomUser()} />
            )}
            <div className='project-sidebar'>
                <Header as='h1' className='logo'>
                    Botfront.
                </Header>
                <Header as='h1' className='simple-logo'>
                    B.
                </Header>
                {loading && renderPlaceholder(true, false)}
                {!loading && (
                    <ProjectSidebarComponent
                        projectId={projectId}
                        handleChangeProject={pid => replace(pathname.replace(/\/project\/.*?\//, `/project/${pid}/`))}
                        triggerIntercom={(id) => {
                            setShowIntercom(true);
                            setIntercomId(id);
                        }}
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
                                language: workingLanguage,
                                upsertResponse,
                                responses,
                                addResponses,
                                refreshEntitiesAndIntents,
                                parseUtterance,
                                addUtterancesToTrainingData,
                                getCanonicalExamples,
                                resetResponseInCache,
                                setResponseInCache,
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
                                                    onClick={() => changeShowChat(!showChat)
                                                    }
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
            <Alert stack={{ limit: 3 }} />
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
    const instanceHandler = Meteor.subscribe('nlu_instances', projectId);
    const slotsHandler = Meteor.subscribe('slots', projectId);
    const instance = Instances.findOne({ projectId });
    const readyHandler = handler => handler;
    const readyHandlerList = [
        Meteor.user(),
        credentialsHandler.ready(),
        projectHandler.ready(),
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
        let credentials = Credentials.findOne({
            $or: [
                { projectId, environment: { $exists: false } },
                { projectId, environment: 'development' },
            ],
        });
        credentials = credentials ? yaml.safeLoad(credentials.credentials) : {};
        channel = credentials['rasa_addons.core.channels.webchat.WebchatInput'];
    }

    // update store if new projectId
    if (storeProjectId !== projectId) {
        changeProjectId(projectId);
    }

    const projectLanguages = ready ? (project.languages || []).map(value => ({ text: languageOptions[value].name, value })) : [];

    // update working language
    if (ready && defaultLanguage && !project.languages.includes(workingLanguage)) {
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

export default connect(mapStateToProps, mapDispatchToProps)(ProjectContainer);
