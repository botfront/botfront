import React from 'react';
import PropTypes from 'prop-types';
import BotResponsePopupContent from './BotResponsePopupContent';
import ActionPopupContent from './ActionPopupContent';
import SlotPopupContent from './SlotPopupContent';
import DashedButton from './DashedButton';
import UserUtterancePopupContent from './UserUtterancePopupContent';

const AddStoryLine = React.forwardRef((props, ref) => {
    const {
        availableActions: {
            userUtterance, botUtterance, action, slot, '...': ellipsis,
        },
        noButtonResponse,
        onSelectResponse,
        onCreateResponse,
        onCreateGenericLine,
        onCreateUtteranceFromInput,
        onCreateUtteranceFromPayload,
        size,
        onBlur,
        trackOpenMenu,
    } = props;

    return (
        <div
            className='add-story-line'
            ref={ref}
            tabIndex={0}
            role='menuitem'
            onBlur={e => onBlur(e)}
        >
            {userUtterance && (
                <UserUtterancePopupContent
                    trigger={(
                        <DashedButton color='blue' size={size} data-cy='add-user-line'>
                            User
                        </DashedButton>
                    )}
                    onCreateFromInput={onCreateUtteranceFromInput}
                    onCreateFromPayload={u => onCreateUtteranceFromPayload(u)}
                    trackOpenMenu={trackOpenMenu}
                />
            )}
            {botUtterance && (
                <BotResponsePopupContent
                    onSelect={r => onSelectResponse(r)}
                    onCreate={r => onCreateResponse(r)}
                    noButtonResponse={noButtonResponse}
                    limitedSelection
                    disableExisting
                    trigger={(
                        <DashedButton color='green' size={size} data-cy='add-bot-line'>
                            Bot
                        </DashedButton>
                    )}
                    trackOpenMenu={trackOpenMenu}
                />
            )}
            {action && (
                <ActionPopupContent
                    onSelect={a => onCreateGenericLine({ action: a })}
                    trigger={(
                        <DashedButton color='pink' size={size} data-cy='add-action-line'>
                            Action
                        </DashedButton>
                    )}
                    trackOpenMenu={trackOpenMenu}
                />
            )}
            {slot && (
                <SlotPopupContent
                    onSelect={({ name, slotValue }) => onCreateGenericLine({ slot_was_set: [{ [name]: slotValue }] })}
                    trigger={(
                        <DashedButton color='orange' size={size} data-cy='add-slot-line'>
                            Slot
                        </DashedButton>
                    )}
                    trackOpenMenu={trackOpenMenu}
                />
            )}
            {ellipsis && (
                <DashedButton
                    color='light-grey'
                    size={size}
                    data-cy='add-...-line'
                    onClick={() => onCreateGenericLine('...')}
                >
                    ...
                </DashedButton>
            )}
        </div>
    );
});

AddStoryLine.propTypes = {
    availableActions: PropTypes.object.isRequired,
    onCreateUtteranceFromInput: PropTypes.func,
    onCreateUtteranceFromPayload: PropTypes.func,
    onSelectResponse: PropTypes.func,
    onCreateResponse: PropTypes.func,
    onCreateGenericLine: PropTypes.func,
    noButtonResponse: PropTypes.bool,
    size: PropTypes.string,
    onBlur: PropTypes.func,
    trackOpenMenu: PropTypes.func,
};

AddStoryLine.defaultProps = {
    onCreateUtteranceFromInput: () => {},
    onCreateUtteranceFromPayload: () => {},
    onSelectResponse: () => {},
    onCreateResponse: () => {},
    onCreateGenericLine: () => {},
    noButtonResponse: false,
    size: 'mini',
    onBlur: () => {},
    trackOpenMenu: () => {},
};

export default AddStoryLine;
