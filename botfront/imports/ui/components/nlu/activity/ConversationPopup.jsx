import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Popup } from 'semantic-ui-react';
import { useLazyQuery } from '@apollo/react-hooks';
import IconButton from '../../common/IconButton';

import { GET_CONVERSATION } from '../../conversations/queries';
import ConversationDialogueViewer from '../../conversations/ConversationDialogueViewer';

const ConversationPopup = (props) => {
    const {
        projectId, datum, open, setOpen,
    } = props;
    const convId = datum.conversation_id;
    const [getConv, { loading: convLoading, data: convData }] = useLazyQuery(GET_CONVERSATION, {
        variables: { projectId, conversationId: convId },
    });
    useEffect(() => {
        if (open && convId) getConv();
    }, [open]);

    const renderPopup = () => (
        <Popup
            id={`conversation-popup-${datum._id}`}
            className={convId ? 'dialogue-popup' : ''}
            open={open}
            hideOnScroll
            onClose={() => setOpen(false)}
            on='click'
            trigger={(
                <div>
                    <IconButton
                        id={`conversation-popup-trigger-${datum._id}`}
                        icon='comments'
                        color='grey'
                        data-cy='conversation-viewer'
                        className={`action-icon ${!convId && 'inactive'}`}
                        name='comments'
                        size='mini'
                        onClick={() => { setOpen(open ? -1 : datum._id); }}
                    />
                </div>
            )}
        >
            {!convLoading && convData && convId && (
                <ConversationDialogueViewer
                    conversation={convData.conversation}
                    messageIdInView={datum.message_id}
                />
            )}
            {!convId && 'No conversation data'}
        </Popup>
    );

    return (
        <Popup
            size='mini'
            inverted
            content={`${new Date(datum.createdAt)}`}
            trigger={(
                <div>
                    {renderPopup()}
                </div>
            )}
            disabled={open} // date tooltip is never open when main popup is open
        />
    );
};

ConversationPopup.propTypes = {
    projectId: PropTypes.string.isRequired,
    datum: PropTypes.object.isRequired,
    open: PropTypes.bool,
    setOpen: PropTypes.func.isRequired,
};

ConversationPopup.defaultProps = {
    open: false,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(ConversationPopup);
