import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '../../common/IconButton';

const ConversationIcon = (props) => {
    const {
        datum, open, setOpen,
    } = props;

    const convId = datum.conversation_id;

    return (
        <div>
            <IconButton
                id={`conversation-popup-trigger-${datum._id}`}
                icon='comments'
                color='grey'
                data-cy='conversation-viewer'
                className={`action-icon ${!convId && 'inactive'}`}
                name='comments'
                size='mini'
                onClick={() => { setOpen(!open); }}
            />
        </div>
    );
};

ConversationIcon.propTypes = {
    datum: PropTypes.object.isRequired,
    open: PropTypes.bool,
    setOpen: PropTypes.func.isRequired,
};

ConversationIcon.defaultProps = {
    open: false,
};

export default ConversationIcon;
