import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, Popup } from 'semantic-ui-react';

import {
    setShowChat, setChatInitPayload, setShouldRefreshChat,
} from '../../store/actions/actions';

const StoryPlayButton = (props) => {
    const {
        changeShowChat,
        changeChatInitPayload,
        refreshChat,
        initPayload,
        className,
    } = props;
    return (
        <Popup
            trigger={(
                <Icon
                    name='play'
                    size='small'
                    disabled={!initPayload}
                    onClick={() => {
                        changeShowChat(true);
                        changeChatInitPayload(`/${initPayload}`);
                        refreshChat(true);
                    }}
                    className={className}
                    data-cy='play-story'
                />
            )}
            content={(
                <>
                    To start a conversation from the story editor, the story must start with a user utterance.
                </>
            )}
            disabled={!!initPayload}
        />
    );
};

StoryPlayButton.propTypes = {
    changeShowChat: PropTypes.func.isRequired,
    changeChatInitPayload: PropTypes.func.isRequired,
    refreshChat: PropTypes.func.isRequired,
    initPayload: PropTypes.string,
    className: PropTypes.string,
};

StoryPlayButton.defaultProps = {
    className: '',
    initPayload: null,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = {
    changeShowChat: setShowChat,
    changeChatInitPayload: setChatInitPayload,
    refreshChat: setShouldRefreshChat,
};


export default connect(mapStateToProps, mapDispatchToProps)(StoryPlayButton);
