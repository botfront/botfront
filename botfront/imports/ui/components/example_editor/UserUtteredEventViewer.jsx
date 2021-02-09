import React from 'react';
import PropTypes from 'prop-types';
import { Comment } from 'semantic-ui-react';

import UserUtteranceViewer from '../nlu/common/UserUtteranceViewer';

export default function UserUtteredEventViewer({ event, author }) {
    return (
        <Comment.Content>
            <Comment.Author as='a'>{author || 'User'}</Comment.Author>
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
