import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Icon, Menu, Segment, Placeholder,
} from 'semantic-ui-react';
import Alert from 'react-s-alert';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { connect } from 'react-redux';
import { GET_CONVERSATION } from './queries';
import { MARK_READ } from './mutations';
import ConversationJsonViewer from './ConversationJsonViewer';
import ConversationDialogueViewer from './ConversationDialogueViewer';
import Can from '../roles/Can';

function ConversationViewer (props) {
    const [active, setActive] = useState('Text');
    const {
        tracker, ready, onDelete, removeReadMark, optimisticlyRemoved,
    } = props;

    const [markRead, { data }] = useMutation(MARK_READ);

    function handleItemClick(event, item) {
        setActive(item.name);
    }
    /*
    function handleItemStatus(event, { name: status }) {
        Meteor.call('conversations.updateStatus', tracker._id, status);
    }
    */

    function handleItemDelete() {
        onDelete(tracker._id);
    }

    function renderSegment() {
        const style = {
            maxHeight: '82vh',
            overflowY: 'scroll',
        };

        if (!ready) {
            return (
                <Segment style={style} attached>
                    <Placeholder>
                        <Placeholder.Header image>
                            <Placeholder.Line />
                            <Placeholder.Line />
                        </Placeholder.Header>
                        <Placeholder.Paragraph>
                            <Placeholder.Line />
                            <Placeholder.Line />
                            <Placeholder.Line />
                            <Placeholder.Line />
                        </Placeholder.Paragraph>
                    </Placeholder>
                    <Placeholder>
                        <Placeholder.Header image>
                            <Placeholder.Line />
                            <Placeholder.Line />
                        </Placeholder.Header>
                        <Placeholder.Paragraph>
                            <Placeholder.Line />
                            <Placeholder.Line />
                            <Placeholder.Line />
                            <Placeholder.Line />
                        </Placeholder.Paragraph>
                    </Placeholder>
                </Segment>
            );
        }

        return (
            <Segment style={style} attached>
                {active === 'Text' && <ConversationDialogueViewer conversation={tracker} mode='text' />}
                {active === 'Debug' && <ConversationDialogueViewer conversation={tracker} mode='debug' />}
                {active === 'JSON' && <ConversationJsonViewer tracker={tracker.tracker} />}
            </Segment>
        );
    }

    useEffect(() => {
        if (tracker && tracker.status !== 'read' && !optimisticlyRemoved.has(tracker._id)) {
            removeReadMark(tracker._id);
            markRead({ variables: { id: tracker._id } });
        }
    }, [props]);

    useEffect(() => {
        if (data && !data.markAsRead.success) {
            Alert.warning('Something went wrong, the conversation was not marked as read', {
                position: 'top-right',
                timeout: 5000,
            });
        }
    }, [data]);

    
    return (
        <div>
            <Menu compact attached='top'>
                {/* <Menu.Item name='new' disabled={!ready} active={ready && tracker.status === 'new'} onClick={this.handleItemStatus}>
                        <Icon name='mail' />
                    </Menu.Item>
                    <Menu.Item name='flagged' disabled={!ready} active={ready && tracker.status === 'flagged'} onClick={this.handleItemStatus}>
                        <Icon name='flag' />
                    </Menu.Item> */}
                <Can I='incoming:w'>
                    <Menu.Item name='archived' disabled={!ready} active={ready && tracker.status === 'archived'} onClick={handleItemDelete}>
                        <Icon name='trash' data-cy='conversation-delete' />
                    </Menu.Item>
                </Can>
                <Menu.Menu position='right'>
                    <Menu.Item name='Text' disabled={!ready} active={ready && active === 'Text'} onClick={handleItemClick}>
                        <Icon name='comments' />
                    </Menu.Item>
                    <Menu.Item name='Debug' disabled={!ready} active={ready && active === 'Debug'} onClick={handleItemClick}>
                        <Icon name='bug' />
                    </Menu.Item>
                    <Menu.Item name='JSON' disabled={!ready} active={ready && active === 'JSON'} onClick={handleItemClick}>
                        <Icon name='code' />
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
            {renderSegment(ready, active, tracker)}
        </div>
    );
}


ConversationViewer.defaultProps = {
    tracker: null,
    optimisticlyRemoved: new Set(),
};

ConversationViewer.propTypes = {
    tracker: PropTypes.object,
    onDelete: PropTypes.func.isRequired,
    ready: PropTypes.bool.isRequired,
    removeReadMark: PropTypes.func.isRequired,
    optimisticlyRemoved: PropTypes.instanceOf(Set),
};

const ConversationViewerContainer = (props) => {
    const {
        conversationId, projectId, onDelete, removeReadMark, optimisticlyRemoved,
    } = props;

    const tracker = useRef(null);
    
    const { loading, error, data } = useQuery(GET_CONVERSATION, {
        variables: { projectId, conversationId },
        pollInterval: 1000,
    });

    const newTracker = !loading && !error && data ? data.conversation : null;
    if (
        (newTracker && (tracker.current ? tracker.current.tracker.events : []).length !== newTracker.tracker.events.length)
        || (newTracker && tracker.current && tracker.current._id !== newTracker._id)
    ) {
        tracker.current = newTracker;
    }
    
    const componentProps = {
        ready: !!tracker.current,
        onDelete,
        tracker: tracker.current,
        removeReadMark,
        optimisticlyRemoved,
    };

    return (<ConversationViewer {...componentProps} />);
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(
    mapStateToProps,
)(ConversationViewerContainer);
