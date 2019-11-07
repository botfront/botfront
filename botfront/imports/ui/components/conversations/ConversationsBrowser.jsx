import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import requiredIf from 'react-required-if';
import { useQuery, useMutation } from '@apollo/react-hooks';
import Alert from 'react-s-alert';
import { Meteor, wrapMeteorCallback } from 'meteor/meteor';
import { browserHistory, withRouter } from 'react-router';
import {
    Container, Grid, Icon, Menu, Message, Segment,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import { GET_CONVERSATIONS } from './queries';
import { DELETE_CONV } from './mutations';
import 'react-select/dist/react-select.css';
import ConversationViewer from './ConversationViewer';
import { Loading } from '../utils/Utils';


import { updateIncomingPath } from '../incoming/incoming.utils';

const PAGE_SIZE = 20;
function ConversationsBrowser(props) {
    const {
        // projectId,
        page,
        nextConvoId,
        prevConvoId,
        // modelId,
        trackers,
        activeConversationId,
        refetch,
        router,
    } = props;

    const [deleteConv, { data }] = useMutation(DELETE_CONV);
    const [optimisticRemoveReadMarker, setOptimisticRemoveReadMarker] = useState(new Set());

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

    function hasNextPage() {
        return !!nextConvoId;
    }

    function hasPreviousPage() {
        return page > 1;
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

    const goToNextPage = () => {
        const url = updateIncomingPath({ ...router.params, page: parseInt(page, 10) + 1, selected_id: nextConvoId });
        browserHistory.push({ pathname: url });
    };

    const goToPreviousPage = () => {
        const url = updateIncomingPath({ ...router.params, page: parseInt(page, 10) - 1, selected_id: prevConvoId });
        browserHistory.push({ pathname: url });
    };
    
    const goToConversation = (localPage, conversationId, replace = false) => {
        // let url = `/project/${projectId}/incoming/${modelId}/conversations/${page || 1}`;
        const url = updateIncomingPath({ ...router.params, page: page || 1, selected_id: conversationId });
        if (replace) return browserHistory.replace({ pathname: url });
        return browserHistory.push({ pathname: url });
    };

    function handleItemClick(event, { name }) {
        goToConversation(page, name);
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

        if (hasPreviousPage()) {
            items.unshift((
                <Menu.Item
                    key={(trackers.length + 1).toString(10)}
                    onClick={goToPreviousPage}
                    data-cy='conversations-previous-page'
                >
                    <span style={{ fontSize: '10px' }}>
                        <strong>{`Previous ${PAGE_SIZE} conversations`}</strong>
                    </span>
                </Menu.Item>
            ));
        }

        if (hasNextPage()) {
            items.push((
                <Menu.Item
                    key={trackers.length.toString(10)}
                    onClick={goToNextPage}
                    data-cy='conversations-next-page'
                >
                    <span style={{ fontSize: '10px' }}>
                        <strong>{`Next ${PAGE_SIZE} conversations`}</strong>
                    </span>
                </Menu.Item>
            ));
        }

        return items;
    }

    function deleteConversation(conversationId) {
        const index = trackers.map(t => t._id).indexOf(conversationId);

        // deleted convo is not the last of the current page
        if (index < trackers.length - 1) {
            goToConversation(page, trackers[index + 1]._id, true);
            // or deleted convo is the last but there is a next page
        } else if (index === trackers.length - 1 && hasNextPage()) {
            goToConversation(page, nextConvoId, true);
            // deleted convo is the last but not the only one and there is no next page
        } else if (index === trackers.length - 1 && trackers.length > 1 && !hasNextPage()) {
            goToConversation(page, trackers[index - 1]._id, true);
            // deleted convo is the last and only but there's a previous page
        } else if (index === trackers.length - 1 && trackers.length === 1 && hasPreviousPage()) {
            goToConversation(page - 1, prevConvoId, true);
            // Anything else
        } else {
            goToConversation(Math.min(page - 1, 1), true);
        }
        deleteConv({ variables: { id: conversationId } });
        refetch();
        Meteor.call('conversations.delete', conversationId, wrapMeteorCallback());
    }

    return (
        <div>
            {trackers.length > 0 ? (
                <Grid>
                    <Grid.Column width={4}>
                        <Menu pointing vertical fluid style={{ marginTop: '41px' }}>
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
                </Grid>
            ) : (
                <Message data-cy='no-conv' info>No conversation to load</Message>
            )}
        </div>
    );
}

ConversationsBrowser.propTypes = {
    trackers: PropTypes.array.isRequired,
    activeConversationId: PropTypes.string,
    page: PropTypes.number.isRequired,
    prevConvoId: PropTypes.string,
    nextConvoId: PropTypes.string,
    // modelId: PropTypes.string,
    // projectId: PropTypes.string,
    refetch: PropTypes.string.isRequired,
    router: PropTypes.object.isRequired,
};

ConversationsBrowser.defaultProps = {
    prevConvoId: {},
    nextConvoId: {},
    activeConversationId: {},
};

function ConversationBrowserSegment({
    loading, projectId, trackers, page, activeConversationId, prevConvoId, nextConvoId, modelId, refetch, router,
}) {
    return (
        <div>
            <Loading loading={loading}>
                <Container>
                    <Message info>Conversations for all languages are displayed.</Message>
                    <Segment>
                        <ConversationsBrowser
                            projectId={projectId}
                            activeConversationId={activeConversationId}
                            trackers={trackers}
                            page={page}
                            prevConvoId={prevConvoId}
                            nextConvoId={nextConvoId}
                            modelId={modelId}
                            refetch={refetch}
                            router={router}
                        />
                    </Segment>
                </Container>
            </Loading>
        </div>
    );
}

ConversationBrowserSegment.propTypes = {
    trackers: requiredIf(PropTypes.array, ({ loading }) => !loading),
    activeConversationId: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    projectId: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    prevConvoId: PropTypes.string,
    nextConvoId: PropTypes.string,
    modelId: PropTypes.string,
    refetch: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
};

ConversationBrowserSegment.defaultProps = {
    trackers: [],
    activeConversationId: null,
    prevConvoId: null,
    nextConvoId: null,
    modelId: '',
};

const ConversationsBrowserContainer = (props) => {
    const { params, router } = props;

    if (!router) {
        return <></>;
    }

    const projectId = router.params.project_id;
    let activeConversationId = router.params.selected_id;
    // const { projectId } = props;
    // let activeConversationId = '';
    let page = parseInt(router.params.page, 10) || 1;
    if (!Number.isInteger(page) || page < 1) {
        page = 1;
    }
    // We take the previous element as well to have the id of the previous convo in the pagination
    const skip = Math.max(0, (page - 1) * PAGE_SIZE - 1);
    // We take the next element as well to have the id of the next convo in the pagination
    const limit = PAGE_SIZE + (page > 1 ? 2 : 1);


    const {
        loading, error, data, refetch,
    } = useQuery(GET_CONVERSATIONS, {
        variables: { projectId, skip, limit },
        pollInterval: 5000,
    });


    const componentProps = {
        page, projectId, modelId: router.params.model_id, refetch, router,
    };

    if (!loading && !error) {
        const { conversations } = data;
        // If for some reason the conversation is not in the current page, discard it.
        if (!conversations.some(c => c._id === activeConversationId)) activeConversationId = null;
        let nextConvoId; let prevConvoId; let from; let to;

        // first page but there are more
        if (page === 1 && conversations.length > PAGE_SIZE) {
            nextConvoId = conversations[conversations.length - 1]._id;
            from = 0;
            to = PAGE_SIZE;
            // first page with less than PAGE_SIZE conversations but not empty
        } else if (page === 1 && conversations.length && conversations.length <= PAGE_SIZE) {
            from = 0;
            to = PAGE_SIZE - 1;
            // not first page but there are more
        } else if (page > 1 && conversations.length === PAGE_SIZE + 2) {
            nextConvoId = conversations[conversations.length - 1]._id;
            prevConvoId = conversations[0]._id;
            from = 1;
            to = PAGE_SIZE + 1;
            // not first page but last one
        } else if (page > 1 && conversations.length <= PAGE_SIZE + 1) {
            prevConvoId = conversations[0]._id;
            from = 1;
            to = conversations.length;
        } else if (conversations.length === 0) {
            /* we get here when either conversations is empty so we can mark loading to false */
            Object.assign(componentProps, { loading: false });
            /* or when we change pages and not all the data from the previous subscription has been removed
        * conversations length could be over pagesize so we just wait front the next Tracker update with the right data */
        } if (!activeConversationId) {
            if (conversations.length > 0) {
                const initialSelection = conversations[from]._id;
                const url = updateIncomingPath({ ...params, page: page || 1, selected_id: initialSelection });
                browserHistory.push({ pathname: url });
            }
            // let url = `/project/${projectId}/incoming/${props.params.model_id}/conversations/${page || 1}`;
            // if (conversations.length > 0) {
            //     url += `/${conversations[from]._id}`;
            //     props.replaceUrl({ pathname: url });
            // }
            // activeConversationId = conversations[from]._id;
        } else {
            Object.assign(componentProps, {
                loading: false,
                trackers: conversations.slice(from, to),
                activeConversationId,
                prevConvoId,
                nextConvoId,
            });
        }
    } else {
        Object.assign(componentProps, {
            loading: true,
            projectId,
            page,
            modelId: router.params.model_id,
        });
    }
    return (<ConversationBrowserSegment {...componentProps} />);
};

ConversationsBrowserContainer.propTypes = {
    params: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

const ConversationsContainerRouter = withRouter(ConversationsBrowserContainer);

export default connect(mapStateToProps)(ConversationsContainerRouter);
