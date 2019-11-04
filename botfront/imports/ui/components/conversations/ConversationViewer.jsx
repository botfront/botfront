import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import {
    Icon, Menu, Segment, Placeholder,
} from 'semantic-ui-react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { connect } from 'react-redux';
import ConversationJsonViewer from './ConversationJsonViewer';
import ConversationDialogueViewer from './ConversationDialogueViewer';

class ConversationViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: 'Text',
        };
    }

    componentWillReceiveProps(props) {
        this.props = props;
        const { tracker } = this.props;
        if (tracker) this.markAsRead(tracker);
    }

    handleItemClick = (event, item) => {
        this.setState({ active: item.name });
    };

    handleItemStatus = (event, { name: status }) => {
        const { tracker } = this.props;
        Meteor.call('conversations.updateStatus', tracker._id, status);
    };

    handleItemDelete = () => {
        const { tracker, onDelete } = this.props;
        onDelete(tracker._id);
    };

    renderSegment = (ready, active, tracker) => {
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

    markAsRead = tracker => Meteor.call('conversations.markAsRead', tracker._id);

    render() {
        const { tracker, ready } = this.props;
        const { active } = this.state;

        return (
            <div>
                <Menu compact attached='top'>
                    {/* <Menu.Item name='new' disabled={!ready} active={ready && tracker.status === 'new'} onClick={this.handleItemStatus}>
                        <Icon name='mail' />
                    </Menu.Item>
                    <Menu.Item name='flagged' disabled={!ready} active={ready && tracker.status === 'flagged'} onClick={this.handleItemStatus}>
                        <Icon name='flag' />
                    </Menu.Item> */}
                    <Menu.Item name='archived' disabled={!ready} active={ready && tracker.status === 'archived'} onClick={this.handleItemDelete}>
                        <Icon name='trash' />
                    </Menu.Item>
                    <Menu.Menu position='right'>
                        <Menu.Item name='Text' disabled={!ready} active={ready && active === 'Text'} onClick={this.handleItemClick}>
                            <Icon name='comments' />
                        </Menu.Item>
                        <Menu.Item name='Debug' disabled={!ready} active={ready && active === 'Debug'} onClick={this.handleItemClick}>
                            <Icon name='bug' />
                        </Menu.Item>
                        <Menu.Item name='JSON' disabled={!ready} active={ready && active === 'JSON'} onClick={this.handleItemClick}>
                            <Icon name='code' />
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>

                {this.renderSegment(ready, active, tracker)}
            </div>
        );
    }
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
    return (
        <Query query={GET_CONVERSATION} variables={{ projectId, conversationId }} pollInterval={1000}>
            {({ loading, error, data }) => {
                const { conversation } = data;
                if (!loading && !error) {
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
            }}
        </Query>
    );
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(
    mapStateToProps,
)(ConversationViewerContainer);
