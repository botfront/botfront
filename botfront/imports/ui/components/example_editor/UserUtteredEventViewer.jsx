import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Comment, Confirm } from 'semantic-ui-react';

import UserUtteranceViewer from '../nlu/common/UserUtteranceViewer';
import { ConversationBrowserContext } from '../conversations/context';

export default function UserUtteredEventViewer({ event, author }) {
    const { modifyFilters } = useContext(ConversationBrowserContext);
    return (
        <Comment.Content>
            <Confirm
                trigger={(
                    <Comment.Author as='a'>{author || 'User'}</Comment.Author>
                )}
                onConfirm={() => { modifyFilters({ userId: author }); }}
                header='Change Filters'
                content='Show all conversations with this user'
                confirmButton='Apply filter'
            />
            <Comment.Metadata>
                <span>{event.timestamp.format('ddd, MMM Do, h:mm:ss a')}</span>
            </Comment.Metadata>
            <Comment.Text className='conversation-user-utterance'>
                <UserUtteranceViewer value={event.example} disableEditing />
                <Comment.Metadata className='conversation-utterance-confidence'>
                    ({event.confidence === 1 ? '100%' : `${(event.confidence * 100).toFixed(2)}%`})
                </Comment.Metadata>
            </Comment.Text>
            <Comment.Actions>
            </Comment.Actions>
        </Comment.Content>
    );
}

UserUtteredEventViewer.propTypes = {
    event: PropTypes.object.isRequired,
    author: PropTypes.string,
};

UserUtteredEventViewer.defaultProps = {
    author: null,
};
