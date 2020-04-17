import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Comment, Confirm, Popup } from 'semantic-ui-react';

import UserUtteranceViewer from '../nlu/common/UserUtteranceViewer';
import { ConversationBrowserContext } from '../conversations/context';

export default function UserUtteredEventViewer({ event, author }) {
    const [open, setOpen] = useState(false);
    const { modifyFilters } = useContext(ConversationBrowserContext);
    return (
        <Comment.Content>
            <Confirm
                open={open}
                trigger={(
                    <Popup
                        flowing
                        disabled={!!author}
                        trigger={(
                            <Comment.Author
                                as='a'
                                onClick={() => {
                                    if (!author) return;
                                    setOpen(true);
                                }}
                                data-cy='utterance-author'
                            >
                                {author || 'User'}
                            </Comment.Author>
                        )}
                        inverted
                        content='No user id is associated with this utterance'
                    />
                )}
                onConfirm={() => {
                    modifyFilters({ userId: author || undefined });
                    setOpen(false);
                }}
                onCancel={() => setOpen(false)}
                header='Change Filters'
                content='Show all conversations with this user'
                confirmButton='Apply filter'
                data-cy='filter-by-user-id-modal'
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
