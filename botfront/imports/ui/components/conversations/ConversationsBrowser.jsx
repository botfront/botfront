import React from 'react';
import PropTypes from 'prop-types';
import requiredIf from 'react-required-if';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { browserHistory } from 'react-router';
import {
    Container, Grid, Icon, Menu, Message, Segment,
} from 'semantic-ui-react';
import 'react-select/dist/react-select.css';

import ConversationViewer from './ConversationViewer';
import { Conversations } from '../../../api/conversations';
import { Loading, PageMenu } from '../utils/Utils';
import { wrapMeteorCallback } from '../utils/Errors';

const PAGE_SIZE = 20;
class ConversationsBrowser extends React.Component {
    renderIcon = (tracker) => {
        if (tracker.status === 'new') {
            return <Icon name='mail' />;
        }

        if (tracker.status === 'flagged') {
            return <Icon name='flag' color='red' />;
        }

        return '';
    };

    goToNextPage = () => {
        const { projectId, page, nextConvoId } = this.props;
        browserHistory.push({ pathname: `/project/${projectId}/dialogue/conversations/p/${page + 1}/c/${nextConvoId}` });
    };

    goToPreviousPage = () => {
        const { projectId, page, prevConvoId } = this.props;
        if (page > 1) {
            browserHistory.push({ pathname: `/project/${projectId}/dialogue/conversations/p/${page - 1}` });
        }
    };

    renderMenuItems = () => {
        const {
            trackers, activeConversationId,
        } = this.props;

        const items = trackers.map((t, index) => (
            <Menu.Item
                key={index.toString(10)}
                name={t._id}
                active={activeConversationId === t._id}
                onClick={this.handleItemClick}
            >
                {this.renderIcon(t)}
                <span style={{ fontSize: '10px' }}>
                    {t._id}
                </span>
            </Menu.Item>
        ));

        if (this.hasPreviousPage()) {
            items.unshift((
                <Menu.Item
                    key={(trackers.length + 1).toString(10)}
                    onClick={this.goToPreviousPage}
                >
                    <span style={{ fontSize: '10px' }}>
                        <strong>{`Previous ${PAGE_SIZE} conversations`}</strong>
                    </span>
                </Menu.Item>
            ));
        }

        if (this.hasNextPage()) {
            items.push((
                <Menu.Item
                    key={trackers.length.toString(10)}
                    onClick={this.goToNextPage}
                >
                    <span style={{ fontSize: '10px' }}>
                        <strong>{`Next ${PAGE_SIZE} conversations`}</strong>
                    </span>
                </Menu.Item>
            ));
        }

        return items;
    };

    handleItemClick = (event, { name }) => {
        const { page } = this.props;
        this.goToConversation(page, name);
    };

    deleteConversation = (conversationId) => {
        const {
            page, trackers, prevConvoId, nextConvoId,
        } = this.props;
        const index = trackers.map(t => t._id).indexOf(conversationId);
        
        // deleted convo is not the last of the current page
        if (index < trackers.length - 1) {
            this.goToConversation(page, trackers[index + 1]._id, true);
        // or deleted convo is the last but there is a next page
        } else if (index === trackers.length - 1 && this.hasNextPage()) {
            this.goToConversation(page, nextConvoId, true);
            // deleted convo is the last but not the only one and there is no next page
        } else if (index === trackers.length - 1 && trackers.length > 1 && !this.hasNextPage()) {
            this.goToConversation(page, trackers[index - 1]._id, true);
        // deleted convo is the last and only but there's a previous page
        } else if (index === trackers.length - 1 && trackers.length === 1 && this.hasPreviousPage()) {
            this.goToConversation(page - 1, prevConvoId, true);
        // Anything else
        } else {
            this.goToConversation(Math.min(page - 1, 1), true);
        }
        Meteor.call('conversations.delete', conversationId, wrapMeteorCallback());
    }

    goToConversation(page, conversationId, replace = false) {
        const { projectId } = this.props;
        let url = `/project/${projectId}/dialogue/conversations/p/${page}`;
        if (conversationId) url += `/c/${conversationId}`;
        if (replace) return browserHistory.replace({ pathname: url });
        return browserHistory.push({ pathname: url });
    }

    hasNextPage() {
        const { nextConvoId } = this.props;
        return !!nextConvoId;
    }

    hasPreviousPage() {
        const { page } = this.props;
        return page > 1;
    }

    render() {
        const { trackers, activeConversationId } = this.props;

        return (
            <div>
                {trackers.length > 0 ? (
                    <Grid>
                        <Grid.Column width={4}>
                            <Menu pointing vertical fluid style={{ marginTop: '41px' }}>
                                {this.renderMenuItems()}
                            </Menu>
                        </Grid.Column>
                        <Grid.Column width={12}>
                            <ConversationViewer
                                conversationId={activeConversationId}
                                onDelete={this.deleteConversation}
                            />
                        </Grid.Column>
                    </Grid>
                ) : (
                    <Message info>No conversation to load</Message>
                )}
            </div>
        );
    }
}

ConversationsBrowser.propTypes = {
    trackers: PropTypes.array.isRequired,
    activeConversationId: PropTypes.string,
    page: PropTypes.number.isRequired,
    projectId: PropTypes.string.isRequired,
    prevConvoId: PropTypes.string,
    nextConvoId: PropTypes.string,
};

ConversationsBrowser.defaultProps = {
    prevConvoId: null,
    nextConvoId: null,
    activeConversationId: null,
};

function ConversationBrowserSegment({
    loading, projectId, trackers, page, activeConversationId, prevConvoId, nextConvoId,
}) {
    return (
        <div>
            <PageMenu title='Conversations History' icon='comments' />
            <Loading loading={loading}>
                <Container>
                    <Segment>
                        <ConversationsBrowser
                            projectId={projectId}
                            activeConversationId={activeConversationId}
                            trackers={trackers}
                            page={page}
                            prevConvoId={prevConvoId}
                            nextConvoId={nextConvoId}
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
};

ConversationBrowserSegment.defaultProps = {
    trackers: [],
    activeConversationId: null,
    prevConvoId: null,
    nextConvoId: null,
};

const ConversationsBrowserContainer = withTracker((props) => {
    const projectId = props.router.params.project_id;
    let activeConversationId = props.router.params.conversation_id;
    let page = parseInt(props.router.params.page, 10);
    if (!Number.isInteger(page) || page < 1) {
        page = 1;
    }

    // We take the previous element as well to have the id of the previous convo in the pagination
    const skip = Math.max(0, (page - 1) * PAGE_SIZE - 1);
    // We take the next element as well to have the id of the next convo in the pagination
    const limit = PAGE_SIZE + (page > 1 ? 2 : 1);
    const options = { sort: { updatedAt: -1 } };
    const selector = {
        projectId,
        status: { $in: ['new', 'read', 'flagged'] },
    };

    const componentProps = { page, projectId, loading: true };
    const conversationsHandler = Meteor.subscribe('conversations', projectId, skip, limit);
    
    if (conversationsHandler.ready()) {
        const conversations = Conversations.find(selector, options).fetch();
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
        } else {
            /* we get here when either conversations is empty so we can mark loading to false */
            if (conversations.length === 0) Object.assign(componentProps, { loading: false });
            /* or when we change pages and not all the data from the previous subscription has been removed
            * conversations length could be over pagesize so we just wait front the next Tracker update with the right data */
            return componentProps;
        }
        
        if (!activeConversationId) {
            let url = `/project/${projectId}/dialogue/conversations/p/${page}`;
            if (conversations.length > 0) url += `/c/${conversations[from]._id}`;
            props.router.replace({ pathname: url });
            return componentProps;
        }

        Object.assign(componentProps, {
            loading: false,
            trackers: conversations.slice(from, to),
            activeConversationId,
            prevConvoId,
            nextConvoId,
        });

        return componentProps;
    }

    return {
        loading: true,
        projectId,
        page,
    };
})(ConversationBrowserSegment);

export default ConversationsBrowserContainer;
