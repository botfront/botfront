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
            userUtterance, botUtterance, action, slot,
        },
        noButtonResponse,
        onSelectResponse,
        onCreateResponse,
        onSelectAction,
        onSelectSlot,
        onCreateUtteranceFromInput,
        onCreateUtteranceFromPayload,
        size,
        onBlur,
    } = props;
    return (
        <div
            className='add-story-line'
            ref={ref}
            tabIndex={0}
            role='menuitem'
            onBlur={e => onBlur(e)}
        >
            { userUtterance && (
                <UserUtterancePopupContent
                    trigger={<DashedButton color='blue' size={size} data-cy='add-user-line'>User</DashedButton>}
                    onCreateFromInput={onCreateUtteranceFromInput}
                    onCreateFromPayload={u => onCreateUtteranceFromPayload(u)}
                />
            )}
            { botUtterance && (
                <BotResponsePopupContent
                    onSelect={r => onSelectResponse(r)}
                    onCreate={r => onCreateResponse(r)}
                    noButtonResponse={noButtonResponse}
                    limitedSelection
                    disableExisting
                    trigger={<DashedButton color='green' size={size} data-cy='add-bot-line'>Bot</DashedButton>}
                />
            )}
            { action && (
                <ActionPopupContent
                    onSelect={a => onSelectAction(a)}
                    trigger={<DashedButton color='pink' size={size} data-cy='add-action-line'>Action</DashedButton>}
                />
            )}
            { slot && (
                <SlotPopupContent
                    onSelect={s => onSelectSlot(s)}
                    trigger={<DashedButton color='orange' size={size} data-cy='add-slot-line'>Slot</DashedButton>}
                />
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
    onSelectAction: PropTypes.func,
    onSelectSlot: PropTypes.func,
    noButtonResponse: PropTypes.bool,
    size: PropTypes.string,
    onBlur: PropTypes.func,
};

AddStoryLine.defaultProps = {
    onCreateUtteranceFromInput: () => {},
    onCreateUtteranceFromPayload: () => {},
    onSelectResponse: () => {},
    onCreateResponse: () => {},
    onSelectAction: () => {},
    onSelectSlot: () => {},
    noButtonResponse: false,
    size: 'mini',
    onBlur: () => {},
};

export default AddStoryLine;
