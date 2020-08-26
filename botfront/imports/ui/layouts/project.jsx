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
import gql from 'graphql-tag';
import { useIntentAndEntityList } from '../components/nlu/models/hooks';
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
import { GET_BOT_RESPONSES, UPSERT_BOT_RESPONSE } from './graphql';
import { INSERT_EXAMPLES, GET_EXAMPLES } from '../components/nlu/models/graphql';
import apolloClient from '../../startup/client/apollo';

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
    const [responses, setResponsesState] = useState({});
    const {
        intents: intentsList,
        entities: entitiesList,
        refetch: refreshEntitiesAndIntents,
    } = useIntentAndEntityList({ projectId, language: workingLanguage });

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

    const getUtteranceFromPayload = (payload, callback = () => {}) => {
        const { intent, entities = [] } = payload;
        if (!intent) throw new Meteor.Error('400', 'Intent missing from payload');
        apolloClient
            .query({
                query: GET_EXAMPLES,
                variables: {
                    projectId,
                    language: workingLanguage,
                    pageSize: -1,
                    intents: [intent],
                    entities,
                    exactMatch: true,
                    sortKey: 'canonical',
                    order: 'DESC',
                },
            })
            .then((res) => {
                const { examples } = res.data.examples;
                if (!examples || !examples.length) {
                    return callback(
                        new Error('No example found for payload'),
                    );
                }
                return wrapMeteorCallback(callback)(null, examples[0]);
            }, wrapMeteorCallback(callback));
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

    const responsesFrag = () => ({
        id: `${projectId}-${workingLanguage}`,
        fragment: gql`
                fragment C on Cached {
                    responses
                }
            `,
    });

    const getMultiLangResponsesFrag = async () => projectLanguages.map(({ value }) => ({
        id: `${projectId}-${value}`,
        fragment: gql`
                fragment C on Cached {
                    responses
                }
            `,
    }));

    const resetResponseInCache = async (responseName) => {
        const frags = await getMultiLangResponsesFrag();
        const fragKeys = Object.keys(frags);
        const readFrags = fragKeys.map(
            key => apolloClient.readFragment(frags[key]) || { responses: {} },
        );
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
    };

    const readResponsesFrag = () => apolloClient.readFragment(responsesFrag()) || { responses: {} };

    const writeResponsesFrag = (incomingResponses) => {
        const newResponses = {
            ...responsesFrag(),
            data: {
                responses: incomingResponses,
                __typename: 'Cached',
            },
        };
        apolloClient.writeFragment(newResponses);
        setResponsesState(incomingResponses);
    };

    const setResponse = async (template, content) => {
        const { responses: oldResponses } = await readResponsesFrag();
        return writeResponsesFrag({ ...oldResponses, [template]: content });
    };

    const setResponses = async (data = {}) => {
        const { responses: oldResponses } = await readResponsesFrag();
        return writeResponsesFrag({ ...oldResponses, ...data });
    };

    const addResponses = async (templates) => {
        const { responses: oldResponses } = await readResponsesFrag();
        const newTemplates = templates.filter(r => !Object.keys(responses).includes(r));
        if (!newTemplates.length) return setResponsesState(oldResponses);
        const result = await apolloClient.query({
            query: GET_BOT_RESPONSES,
            variables: {
                templates: newTemplates,
                projectId,
                language: workingLanguage,
            },
        });
        if (!result.data) return setResponsesState(oldResponses);
        await setResponses(
            result.data.getResponses.reduce(
                // turns [{ k: k1, v1, v2 }, { k: k2, v1, v2 }] into { k1: { v1, v2 }, k2: { v1, v2 } }
                (acc, { key, ...rest }) => ({
                    ...acc,
                    ...(key in acc ? {} : { [key]: rest }),
                }),
                {},
            ),
        );
        return Date.now();
    };

    const upsertResponse = async (key, newResponse, index) => {
        const { payload, key: newKey } = newResponse;
        const { isNew, ...newPayload } = payload; // don't pass isNew to mutation
        let responseTypeVariable = {};
        // if the response type has changed; add newResponseType to the queryVariables
        if (responses[key] && responses[key].__typename !== payload.__typename) {
            responseTypeVariable = { newResponseType: payload.__typename };
            resetResponseInCache(key);
        }
        if (newKey) resetResponseInCache(newKey);
        const variables = {
            projectId,
            language: workingLanguage,
            newPayload,
            key,
            newKey,
            index,
            ...responseTypeVariable,
        };
        const result = await apolloClient.mutate({
            mutation: UPSERT_BOT_RESPONSE,
            variables,
            update: () => setResponse(newKey || key, { isNew, ...newPayload }),
        });
        return result;
    };

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
                                getUtteranceFromPayload,
                                parseUtterance,
                                addUtterancesToTrainingData,
                                getCanonicalExamples,
                                resetResponseInCache,
                                setResponseInCache: setResponse,
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
                                projectId={projectId}
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
        changeWorkingLanguage,
        changeProjectId,
    } = props;
    if (!projectId) return browserHistory.replace({ pathname: '/404' });
    const projectHandler = Meteor.subscribe('projects', projectId);
    const nluModelsHandler = Meteor.subscribe('nlu_models.lite');
    const credentialsHandler = Meteor.subscribe('credentials', projectId);
    const instanceHandler = Meteor.subscribe('nlu_instances', projectId);
    const slotsHandler = Meteor.subscribe('slots', projectId);
    const instance = Instances.findOne({ projectId });
    const readyHandler = handler => handler;
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

export default connect(mapStateToProps, mapDispatchToProps)(ProjectContainer);

export function WithRefreshOnLoad(Component) {
    return props => (
        <ProjectContext.Consumer>
            {({ refreshEntitiesAndIntents }) => (
                <Component {...props} onLoad={refreshEntitiesAndIntents || (() => {})} />
            )}
        </ProjectContext.Consumer>
    );
}
