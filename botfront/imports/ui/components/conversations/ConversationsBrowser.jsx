import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation, useLazyQuery } from '@apollo/react-hooks';
import Alert from 'react-s-alert';
import { browserHistory, withRouter } from 'react-router';
import {
    Container, Grid, Icon, Menu, Message, Pagination,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import { Meteor } from 'meteor/meteor';
import { GET_CONVERSATIONS, GET_INTENTS_IN_CONVERSATIONS } from './queries';
import { DELETE_CONV } from './mutations';
import ConversationViewer from './ConversationViewer';
import ConversationFilters from './ConversationFilters';
import { Loading } from '../utils/Utils';
import { updateIncomingPath } from '../incoming/incoming.utils';
import { wrapMeteorCallback } from '../utils/Errors';
import { Projects } from '../../../api/project/project.collection';
import { applyTimezoneOffset } from '../../../lib/graphs';


function ConversationsBrowser(props) {
    const {
        page,
        pages,
        trackers,
        activeConversationId,
        refetch,
        router,
        activeFilters,
        setActiveFilters,
        actionsOptions,
        setActionOptions,
        loading,
        projectId,
        intentsOptions,
    } = props;

    const [deleteConv, { data }] = useMutation(DELETE_CONV);
    const [optimisticRemoveReadMarker, setOptimisticRemoveReadMarker] = useState(new Set());

    const [projectTimezoneOffset, setProjectTimezoneOffset] = useState(0);

    useEffect(() => {
        const {
            timezoneOffset,
        } = Projects.findOne({ _id: projectId }, { fields: { timezoneOffset: 1 } });
        setProjectTimezoneOffset(timezoneOffset || 0);
    }, []);

    useEffect(() => {
        if (data && !data.delete.success) {
            Alert.warning('Something went wrong, the conversation was not deleted', {
                position: 'top-right',
                timeout: 5000,
            });
        }
    }, [data]);

    useEffect(() => { // empty the optimistic marking of read message when new data arrive
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
        const url = updateIncomingPath({ ...router.params, page: newPage || 1, selected_id: conversationId });
        if (replace) return browserHistory.replace({ pathname: url });
        return browserHistory.push({ pathname: url });
    };

    function handleItemClick(event, { name }) {
        goToConversation(page, name);
    }

    function pageChange(newPage) {
        const url = updateIncomingPath({ ...router.params, page: newPage || 1 }, 'selected_id');
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
                {optimisticRemoveReadMarker.has(t._id) ? renderIcon({ status: 'read' }) : renderIcon(t)}
                <span style={{ fontSize: '10px' }}>
                    {t._id}
                </span>
            </Menu.Item>
        ));
        return items;
    }

    function changeFilters(lengthFilter, confidenceFilter, actionFilters, startDate, endDate, userId, operatorActionsFilters, operatorIntentsFilters, intentFilters) {
        const offsetStart = startDate ? applyTimezoneOffset(startDate, projectTimezoneOffset) : null;
        const offsetEnd = endDate ? applyTimezoneOffset(endDate, projectTimezoneOffset) : null;
        setActiveFilters({
            lengthFilter: parseInt(lengthFilter.compare, 10),
            xThanLength: lengthFilter.xThan,
            confidenceFilter: parseFloat(confidenceFilter.compare, 10) / 100,
            xThanConfidence: confidenceFilter.xThan,
            actionFilters,
            startDate: offsetStart,
            endDate: offsetEnd,
            userId,
            operatorActionsFilters,
            operatorIntentsFilters,
            intentFilters,
        });
        refetch();
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
        deleteConv({ variables: { id: conversationId } });
        refetch();
    }

    return (
        <div>
            <Grid>
                <Grid.Row>
                    <ConversationFilters
                        lengthFilter={activeFilters.lengthFilter}
                        xThanLength={activeFilters.xThanLength}
                        confidenceFilter={activeFilters.confidenceFilter}
                        xThanConfidence={activeFilters.xThanConfidence}
                        actionFilters={activeFilters.actionFilters}
                        intentFilters={activeFilters.intentFilters}
                        startDate={activeFilters.startDate}
                        endDate={activeFilters.endDate}
                        operatorActionsFilters={activeFilters.operatorActionsFilters}
                        operatorIntentsFilters={activeFilters.operatorIntentsFilters}
                        changeFilters={changeFilters}
                        actionsOptions={actionsOptions}
                        setActionOptions={setActionOptions}
                        intentsOptions={intentsOptions}
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
                                ) : <></>}

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
                                <Message data-cy='no-conv' info>No conversations to load.</Message>
                            </Grid.Column>
                        )}
                </Loading>
            </Grid>
        </div>
    );
}

ConversationsBrowser.propTypes = {
    trackers: PropTypes.array,
    activeConversationId: PropTypes.string,
    page: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    refetch: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
    activeFilters: PropTypes.object,
    setActiveFilters: PropTypes.func.isRequired,
    actionsOptions: PropTypes.array,
    intentsOptions: PropTypes.array,
    setActionOptions: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    projectId: PropTypes.string.isRequired,
};

ConversationsBrowser.defaultProps = {
    trackers: [],
    activeConversationId: null,
    activeFilters: {},
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

    const [activeFilters, setActiveFilters] = useState({
        lengthFilter: -1,
        xThanLength: 'greaterThan',
        confidenceFilter: -1,
        xThanConfidence: 'lessThan',
        actionFilters: [],
        startDate: null,
        endDate: null,
        timeZoneHoursOffset: null,
        userId: null,
        operatorActionsFilters: 'or',
        operatorIntentsFilters: 'or',
        intentFilters: [],
    });
    const [actionsOptions, setActionOptions] = useState([]);
    const [intentsOptions, setIntentsOptions] = useState([]);

    const [loadIntents] = useLazyQuery(GET_INTENTS_IN_CONVERSATIONS, {
        variables: { projectId },
        onCompleted: (data) => {
            setIntentsOptions(data.intentsInConversations.map(((intent) => {
                if (intent === null) return { value: null, text: 'null', key: 'null' };
                return { value: intent, text: intent, key: intent };
            })));
        },
    });
    useEffect(() => {
        loadIntents();
        Meteor.call(
            'project.getActions',
            projectId,
            wrapMeteorCallback((err, res) => {
                if (!err) {
                    setActionOptions(res.map(action => ({ text: action, value: action, key: action })));
                }
            }),
        );
    }, []);


    const {
        loading, error, data, refetch,
    } = useQuery(GET_CONVERSATIONS, {
        variables: {
            projectId,
            page,
            pageSize: 20,
            env,
            ...activeFilters,
            startDate: activeFilters.startDate,
            endDate: activeFilters.endDate,
            userId: activeFilters.userId,
            operatorActionsFilters: activeFilters.operatorActionsFilters,
            operatorIntentsFilters: activeFilters.operatorIntentsFilters,
            intentFilters: activeFilters.intentFilters,
        },
        pollInterval: 5000,
    });

    const componentProps = {
        page, projectId, router, refetch, activeFilters, setActiveFilters, actionsOptions, setActionOptions, intentsOptions,
    };

    if (!loading && !error) {
        const { conversations, pages } = data.conversationsPage;

        // If for some reason the conversation is not in the current page, discard it.
        if (!conversations.some(c => c._id === activeConversationId)) activeConversationId = null;
        if (!activeConversationId && conversations.length > 0) {
            const url = updateIncomingPath({
                ...router.params, tab: 'conversations', page: page || 1, selected_id: conversations[0]._id,
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
                <ConversationsBrowser
                    {...componentProps}
                    loading={loading}
                />
            </Container>
        </div>
    );
};

ConversationsBrowserContainer.propTypes = {
    router: PropTypes.object.isRequired,
    environment: PropTypes.string,
};

ConversationsBrowserContainer.defaultProps = {
    environment: 'developement',
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

const ConversationsRouter = withRouter(ConversationsBrowserContainer);

export default connect(mapStateToProps)(ConversationsRouter);
