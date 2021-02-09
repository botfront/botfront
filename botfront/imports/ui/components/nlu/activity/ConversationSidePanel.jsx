import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';

import { Icon } from 'semantic-ui-react';
import { GET_CONVERSATION } from '../../conversations/queries';
import ConversationDialogueViewer from '../../conversations/ConversationDialogueViewer';

const ConversationPopup = (props) => {
    const { projectId, utterance, onClose } = props;
    const { loading: convLoading, data: convData } = useQuery(GET_CONVERSATION, {
        variables: { projectId, senderId: utterance.conversation_id },
    });

    return (
        <div
            className='conversation-side-panel'
            data-cy='conversation-side-panel'
        >
            {!convLoading && convData && (
                <>
                    <div className='header'>
                        <span>Conversation</span> <Icon name='close' link onClick={onClose} />{' '}
                    </div>
                    <ConversationDialogueViewer
                        conversation={convData.conversation}
                        messageIdInView={utterance.message_id}
                    />
                </>
            )}
            {!utterance && 'No conversation data'}
        </div>
    );
};

ConversationPopup.propTypes = {
    projectId: PropTypes.string.isRequired,
    utterance: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};

ConversationPopup.defaultProps = {
    utterance: false,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(ConversationPopup);
