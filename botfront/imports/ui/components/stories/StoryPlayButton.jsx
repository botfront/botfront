import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, Popup } from 'semantic-ui-react';

import {
    setShowChat,
    setChatInitPayload,
    setShouldRefreshChat,
} from '../../store/actions/actions';

const StoryPlayButton = (props) => {
    const {
        changeShowChat,
        changeChatInitPayload,
        refreshChat,
        fragment: { steps = [], rules = [] } = {},
        className,
    } = props;

    const getInitialPayload = () => {
        const bonifiedSteps = steps;
        const { intent, entities = [] } = bonifiedSteps[0].or
            ? bonifiedSteps[0].or[0]
            : bonifiedSteps[0];
        const entitiesString = entities.length
            ? JSON.stringify(entities.reduce((acc, curr) => ({ ...acc, ...curr }), {}))
            : '';
        return `${intent}${entitiesString}`;
    };
    const disabled = !rules.length && !steps?.[0]?.intent && !steps?.[0]?.or;
    return (
        <Popup
            trigger={(
                <Icon
                    name='play'
                    size='small'
                    disabled={disabled}
                    onClick={() => {
                        changeShowChat(true);
                        changeChatInitPayload(`/${getInitialPayload()}`);
                        refreshChat(true);
                    }}
                    className={className}
                    data-cy='play-story'
                />
            )}
            content={(
                <>
                    To start a conversation from the story editor, the story must start
                    with a user utterance.
                </>
            )}
            disabled={disabled}
        />
    );
};

StoryPlayButton.propTypes = {
    changeShowChat: PropTypes.func.isRequired,
    changeChatInitPayload: PropTypes.func.isRequired,
    refreshChat: PropTypes.func.isRequired,
    fragment: PropTypes.object.isRequired,
    className: PropTypes.string,
};

StoryPlayButton.defaultProps = {
    className: '',
};

const mapStateToProps = () => ({});

const mapDispatchToProps = {
    changeShowChat: setShowChat,
    changeChatInitPayload: setChatInitPayload,
    refreshChat: setShouldRefreshChat,
};

export default connect(mapStateToProps, mapDispatchToProps)(StoryPlayButton);
