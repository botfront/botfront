import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import {
    Icon, Menu, Segment, Placeholder,
} from 'semantic-ui-react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { connect } from 'react-redux';
import ConversationJsonViewer from './ConversationJsonViewer';
import ConversationDialogueViewer from './ConversationDialogueViewer';

function ConversationViewer (props) {
    const [active, setActive] = useState('Text');
    const { tracker, ready, onDelete } = props;

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
                {active === 'Text' && <ConversationDialogueViewer tracker={tracker.tracker} mode='text' />}
                {active === 'Debug' && <ConversationDialogueViewer tracker={tracker.tracker} mode='debug' />}
                {active === 'JSON' && <ConversationJsonViewer tracker={tracker.tracker} />}
            </Segment>
        );
    }

    function markAsRead() {
        Meteor.call('conversations.markAsRead', tracker._id);
    }

    useEffect(() => {
        if (tracker) markAsRead(tracker);
    }, [props]);

    
    return (
        <div>
            <Menu compact attached='top'>
                {/* <Menu.Item name='new' disabled={!ready} active={ready && tracker.status === 'new'} onClick={this.handleItemStatus}>
                        <Icon name='mail' />
                    </Menu.Item>
                    <Menu.Item name='flagged' disabled={!ready} active={ready && tracker.status === 'flagged'} onClick={this.handleItemStatus}>
                        <Icon name='flag' />
                    </Menu.Item> */}
                <Menu.Item name='archived' disabled={!ready} active={ready && tracker.status === 'archived'} onClick={handleItemDelete}>
                    <Icon name='trash' />
                </Menu.Item>
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
};

ConversationViewer.propTypes = {
    tracker: PropTypes.object,
    onDelete: PropTypes.func.isRequired,
    ready: PropTypes.bool.isRequired,
};

const ConversationViewerContainer = (props) => {
    const { conversationId, projectId, onDelete } = props;

    const GET_CONVERSATION = gql`
      query retreiveConv($projectId: String!, $conversationId: String!)
      {
        conversation(projectId: $projectId, id: $conversationId ) {
            tracker {
                sender_id
                latest_message{
                    text
                    intent{
                        confidence
                        name
                    }
                    intent_ranking{
                        confidence
                        name
                    }
                    entities {
                            entity
                            value
                            start
                            end
                        }
                }
                events {
                    event
                    text
                    timestamp
                    name
                    policy
                    confidence
                    parse_data {
                        intent_ranking{
                            confidence
                            name
                        }
                        intent {
                            confidence
                            name
                        }
                        text 
                        language 
                        project 
                        entities {
                            entity
                            value
                            start
                            end
                        }
                    }
                }
            }
            status
            _id
      }
    }`;


    const { loading, error, data } = useQuery(GET_CONVERSATION, {
        variables: { projectId, conversationId },
        pollInterval: 1000,
    });

    let conversation = null;
    if (!loading && !error) {
        ({ conversation } = data);
        if (!conversation) {
            browserHistory.replace({ pathname: `/project/${projectId}/dialogue/conversations/p/1` });
        }
    }
    
    const componentProps = {
        ready: !loading && !!conversation,
        onDelete,
        tracker: conversation,
    };
      
    return (<ConversationViewer {...componentProps} />);
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(
    mapStateToProps,
)(ConversationViewerContainer);
