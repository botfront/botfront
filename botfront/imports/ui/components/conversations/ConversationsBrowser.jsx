import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';
import Alert from 'react-s-alert';
import { browserHistory, withRouter } from 'react-router';
import {
    Container, Grid, Icon, Menu, Message, Pagination,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import { saveAs } from 'file-saver';
import { GET_CONVERSATIONS, GET_INTENTS_IN_CONVERSATIONS } from './queries';
import { DELETE_CONV } from './mutations';
import ConversationViewer from './ConversationViewer';
import ConversationFilters from './ConversationFilters';
import { Loading } from '../utils/Utils';
import { updateIncomingPath } from '../incoming/incoming.utils';
import { wrapMeteorCallback } from '../utils/Errors';
import { Projects } from '../../../api/project/project.collection';
import { applyTimezoneOffset } from '../../../lib/graphs';
import apolloClient from '../../../startup/client/apollo';
import { formatConversationsInMd } from './utils';
import { ConversationBrowserContext } from './context';
import { clearTypenameField } from '../../../lib/client.safe.utils';

function ConversationsBrowser(props) {
    const {
        page,
        pages,
        trackers,
        activeConversationId,
        refetch,
        router,
        activeFilters,
        changeFilters,
        actionsOptions,
        setActionOptions,
        loading,
        intentsOptions,
        handleDownloadConversations,
    } = props;

    const [deleteConv, { data }] = useMutation(DELETE_CONV);
    const [optimisticRemoveReadMarker, setOptimisticRemoveReadMarker] = useState(
        new Set(),
    );

    useEffect(() => {
        if (data && !data.delete.success) {
            Alert.warning('Something went wrong, the conversation was not deleted', {
                position: 'top-right',
                timeout: 5000,
            });
        }
    }, [data]);

    useEffect(() => {
        // empty the optimistic marking of read message when new data arrive
        setOptimisticRemoveReadMarker(new Set());
    }, [trackers]);

    function optimisticRemoveMarker(id) {
        setOptimisticRemoveReadMarker(new Set([...optimisticRemoveReadMarker, id]));
    }

    function renderIcon(tracker) {
        if (tracker.status === 'new') {
            return <Icon name='mail' />;
        }

        if (tracker.status === 'flagged') {
            return <Icon name='flag' color='red' />;
        }

        return '';
    }

    const goToConversation = (newPage, conversationId, replace = false) => {
        // let url = `/project/${projectId}/incoming/${modelId}/conversations/${page || 1}`;
        const url = updateIncomingPath({
            ...router.params,
            page: newPage || 1,
            selected_id: conversationId,
        });
        if (replace) return browserHistory.replace({ pathname: url });
        return browserHistory.push({ pathname: url });
    };

    function handleItemClick(event, { name }) {
        goToConversation(page, name);
    }

    const handleModifyFilters = (updatedFilters) => {
        changeFilters({ ...activeFilters, ...updatedFilters });
    };

    function pageChange(newPage) {
        const url = updateIncomingPath(
            { ...router.params, page: newPage || 1 },
            'selected_id',
        );
        return browserHistory.push({ pathname: url });
    }

    function renderMenuItems() {
        const items = trackers.map((t, index) => (
            <Menu.Item
                key={index.toString(10)}
                name={t._id}
                active={activeConversationId === t._id}
                onClick={handleItemClick}
                data-cy='conversation-item'
            >
                {optimisticRemoveReadMarker.has(t._id)
                    ? renderIcon({ status: 'read' })
                    : renderIcon(t)}
                <span style={{ fontSize: '10px' }}>{t._id}</span>
            </Menu.Item>
        ));
        return items;
    }

    function deleteConversation(conversationId) {
        const index = trackers.map(t => t._id).indexOf(conversationId);
        // deleted convo is not the last of the current page
        if (index < trackers.length - 1) {
            goToConversation(page, trackers[index + 1]._id, true);
            // or deleted convo is the last but there is a next page
        } else if (index === trackers.length - 1 && trackers.length > 1) {
            goToConversation(page, trackers[index - 1]._id, true);
            // deleted convo is the last but not the only one and there is no next page
        } else if (index === 0 && trackers.length === 1) {
            goToConversation(Math.max(page - 1, 1), undefined, true);
        } else {
            goToConversation(Math.min(page - 1, 1), undefined, true);
        }
        deleteConv({ variables: { id: conversationId } }).then(() => refetch());
    }

    return (
        <ConversationBrowserContext.Provider
            value={{
                modifyFilters: handleModifyFilters,
            }}
        >
            <div>
                <Grid>
                    <Grid.Row>
                        <ConversationFilters
                            activeFilters={activeFilters}
                            changeFilters={changeFilters}
                            actionsOptions={actionsOptions}
                            setActionOptions={setActionOptions}
                            intentsOptions={intentsOptions}
                            onDownloadConversations={handleDownloadConversations}
                        />
                    </Grid.Row>
                    <Loading loading={loading}>
                        {trackers.length > 0 ? (
                            <>
                                <Grid.Column width={4}>
                                    {pages > 1 ? (
                                        <Pagination
                                            totalPages={pages}
                                            onPageChange={(e, { activePage }) => pageChange(activePage)}
                                            activePage={page}
                                            boundaryRange={0}
                                            siblingRange={0}
                                            size='mini'
                                            firstItem='1'
                                            lastItem={`${pages}`}
                                            data-cy='pagination'
                                        />
                                    ) : (
                                        <></>
                                    )}

                                    <Menu pointing vertical fluid>
                                        {renderMenuItems()}
                                    </Menu>
                                </Grid.Column>
                                <Grid.Column width={12}>
                                    <ConversationViewer
                                        conversationId={activeConversationId}
                                        onDelete={deleteConversation}
                                        removeReadMark={optimisticRemoveMarker}
                                        optimisticlyRemoved={optimisticRemoveReadMarker}

                                    />
                                </Grid.Column>
                            </>
                        ) : (
                            <Grid.Column width={16}>
                                <Message data-cy='no-conv' info>
                                No conversations to load.
                                </Message>
                            </Grid.Column>
                        )}
                    </Loading>
                </Grid>
            </div>
        </ConversationBrowserContext.Provider>
    );
}

ConversationsBrowser.propTypes = {
    trackers: PropTypes.array,
    activeConversationId: PropTypes.string,
    page: PropTypes.number.isRequired,
    pages: PropTypes.number,
    refetch: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
    activeFilters: PropTypes.object.isRequired,
    changeFilters: PropTypes.func.isRequired,
    actionsOptions: PropTypes.array,
    intentsOptions: PropTypes.array,
    setActionOptions: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    handleDownloadConversations: PropTypes.func.isRequired,
};

ConversationsBrowser.defaultProps = {
    pages: 1,
    trackers: [],
    activeConversationId: null,
    actionsOptions: [],
    intentsOptions: [],
};

const ConversationsBrowserContainer = (props) => {
    const { environment: env, router } = props;
    if (!router) {
        return <></>;
    }

    const projectId = router.params.project_id;
    let activeConversationId = router.params.selected_id;
    const page = parseInt(router.params.page, 10) || 1;

    const defaults = {
        lengthFilter: { compare: -1, xThan: 'greaterThan' },
        durationFilter: { compare: -1, xThan: 'greaterThan' },
        confidenceFilter: { compare: -1, xThan: 'lessThan' },
        actionFilters: [],
        intentFilters: [],
        startDate: moment().subtract(7, 'd').set({
            hour: 0, minute: 0, second: 0,
        }),
        endDate: moment().set({
            hour: 23, minute: 59, second: 59,
        }),
        operatorActionsFilters: 'or',
        operatorIntentsFilters: 'or',
        userId: null,
    };

    const [activeFilters, setActiveFilters] = useState(defaults);
    const [actionsOptions, setActionOptions] = useState([]);
    const [intentsOptions, setIntentsOptions] = useState([]);
    const [projectTimezoneOffset, setProjectTimezoneOffset] = useState(0);

    function changeFilters(vals = defaults) {
        setActiveFilters({
            ...vals,
            startDate: vals.startDate
                ? applyTimezoneOffset(vals.startDate, projectTimezoneOffset)
                : null,
            endDate: vals.endDate
                ? applyTimezoneOffset(vals.endDate, projectTimezoneOffset)
                : null,
        });
    }

    useEffect(() => {
        const { timezoneOffset } = Projects.findOne(
            { _id: projectId },
            { fields: { timezoneOffset: 1 } },
        );
        setProjectTimezoneOffset(
            timezoneOffset || 0,
        );
    }, [projectId]);

    useEffect(changeFilters, [projectTimezoneOffset]);


    useQuery(GET_INTENTS_IN_CONVERSATIONS, {
        variables: { projectId },
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            setIntentsOptions(
                data.intentsInConversations.map((intent) => {
                    if (intent === null) { return { value: null, text: 'null', key: 'null' }; }
                    return { value: intent, text: intent, key: intent };
                }),
            );
        },
    });


    useEffect(() => {
        Meteor.call(
            'project.getActions',
            projectId,
            wrapMeteorCallback((err, res) => {
                if (!err) {
                    setActionOptions(
                        res.map(action => ({
                            text: action,
                            value: action,
                            key: action,
                        })),
                    );
                }
            }),
        );
    }, []);

    const queryVariables = useMemo(() => ({
        projectId,
        page,
        pageSize: 20,
        env,
        ...activeFilters,
        lengthFilter: activeFilters.lengthFilter.compare,
        durationFilter: activeFilters.durationFilter.compare,
        xThanDuration: activeFilters.durationFilter.xThan,
        xThanLength: activeFilters.lengthFilter.xThan,
        confidenceFilter: activeFilters.confidenceFilter.compare,
        xThanConfidence: activeFilters.confidenceFilter.xThan,
    }), [activeFilters, env, page]);

    const {
        loading, error, data, refetch,
    } = useQuery(GET_CONVERSATIONS, {
        variables: queryVariables,
    });

    const handleDownloadConversations = ({ format = 'json' } = {}) => {
        apolloClient
            .query({
                query: GET_CONVERSATIONS,
                variables: {
                    ...queryVariables,
                    pageSize: -1,
                    page: 1,
                    fetchTrackers: true,
                },
            })
            .then(({ data: { conversationsPage } = {} }) => {
                if (!conversationsPage || !conversationsPage.conversations.length) return false;
                let blob;
                if (format === 'json') {
                    blob = new Blob(
                        [JSON.stringify({ conversations: clearTypenameField(conversationsPage.conversations), project: { _id: projectId } })],
                        { type: 'application/json;charset=utf-8' },
                    );
                }
                if (format === 'md') {
                    blob = new Blob(
                        [formatConversationsInMd(conversationsPage.conversations)],
                        { type: 'text/markdown;charset=utf-8' },
                    );
                }
                return saveAs(blob, `conversations.${format}`);
            });
    };

    const componentProps = {
        page,
        projectId,
        router,
        refetch,
        activeFilters,
        setActiveFilters,
        actionsOptions,
        setActionOptions,
        intentsOptions,
        handleDownloadConversations,
        changeFilters,
    };

    if (activeFilters && !loading && !error) {
        const { conversations, pages } = data.conversationsPage;

        // If for some reason the conversation is not in the current page, discard it.
        if (!conversations.some(c => c._id === activeConversationId)) activeConversationId = null;
        if (!activeConversationId && conversations.length > 0) {
            const url = updateIncomingPath({
                ...router.params,
                tab: 'conversations',
                page: page || 1,
                selected_id: conversations[0]._id,
            }); // tab will always be conversations if set on the converesations tab
            browserHistory.replace({ pathname: url });
        } else {
            Object.assign(componentProps, {
                trackers: conversations,
                activeConversationId,
                pages,
            });
        }
    } else {
        Object.assign(componentProps, {
            projectId,
            page,
            pages: 1,
            modelId: router.params.model_id,
        });
    }
    return (
        <div>
            <Container>
                <ConversationsBrowser {...componentProps} loading={loading} />
            </Container>
        </div>
    );
};

ConversationsBrowserContainer.propTypes = {
    router: PropTypes.object.isRequired,
    environment: PropTypes.string,
};

ConversationsBrowserContainer.defaultProps = {
    environment: 'development',
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    environment: state.settings.get('workingDeploymentEnvironment'),
});

const ConversationsRouter = withRouter(ConversationsBrowserContainer);

export default connect(mapStateToProps)(ConversationsRouter);
