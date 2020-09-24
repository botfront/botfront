import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import requiredIf from 'react-required-if';
import { useQuery, useMutation } from '@apollo/react-hooks';
import Alert from 'react-s-alert';
import { browserHistory, withRouter } from 'react-router';
import {
    Container, Grid, Icon, Menu, Message, Pagination,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import { GET_CONVERSATIONS } from './queries';
import { DELETE_CONV } from './mutations';
import 'react-select/dist/react-select.css';
import ConversationViewer from './ConversationViewer';
import { Loading } from '../utils/Utils';
import { updateIncomingPath } from '../incoming/incoming.utils';


function ConversationsBrowser(props) {
    const {
        page,
        pages,
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

    if (!trackers.length) return <Message data-cy='no-conv' info>No conversation to load</Message>;
    return (
        <Grid>
            <Grid.Column width={5}>
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

                <Menu pointing vertical fluid className='conversation-browser'>
                    {renderMenuItems()}

                </Menu>
            </Grid.Column>
            <Grid.Column width={11}>
                <ConversationViewer
                    conversationId={activeConversationId}
                    onDelete={deleteConversation}
                    removeReadMark={optimisticRemoveMarker}
                    optimisticlyRemoved={optimisticRemoveReadMarker}
                />
            </Grid.Column>
        </Grid>
    );
}

ConversationsBrowser.propTypes = {
    trackers: requiredIf(PropTypes.array, ({ loading }) => !loading),
    activeConversationId: PropTypes.string,
    page: PropTypes.number.isRequired,
    pages: PropTypes.number,
    refetch: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
};

ConversationsBrowser.defaultProps = {
    trackers: [],
    activeConversationId: null,
    pages: 1,
};


const ConversationsBrowserContainer = (props) => {
    const { router } = props;
    if (!router) {
        return <></>;
    }

    const projectId = router.params.project_id;
    let activeConversationId = router.params.selected_id;
    let page = parseInt(router.params.page, 10) || 1;
    if (!Number.isInteger(page) || page < 1) {
        page = 1;
    }


    const {
        loading, error, data, refetch,
    } = useQuery(GET_CONVERSATIONS, {
        variables: { projectId, page, pageSize: 20 },
        pollInterval: 5000,
    });


    const componentProps = {
        page, projectId, refetch, router,
    };

    if (!loading && !error) {
        const { conversations, pages } = data.conversationsPage;

        // If for some reason the conversation is not in the current page, discard it.
        if (!conversations.some(c => c._id === activeConversationId)) activeConversationId = null;
        if (!activeConversationId && conversations.length) {
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
            modelId: router.params.model_id,
        });
    }
    return (
        <Loading loading={loading}>
            <ConversationsBrowser
                {...componentProps}
            />
        </Loading>
    );
};

ConversationsBrowserContainer.propTypes = {
    router: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

const ConversationsRouter = withRouter(ConversationsBrowserContainer);

export default connect(mapStateToProps)(ConversationsRouter);
