import React from 'react';
import PropTypes from 'prop-types';
import BotResponsePopupContent from './BotResponsePopupContent';
import ActionPopupContent from './ActionPopupContent';
import SlotPopupContent from './SlotPopupContent';
import DashedButton from './DashedButton';
import UserUtterancePopupContent from './UserUtterancePopupContent';

const AddStoryLine = (props) => {
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
    } = props;
    return (
        <div className='add-story-line'>
            { userUtterance && (
                <UserUtterancePopupContent
                    trigger={<DashedButton color='blue'>User says:</DashedButton>}
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
                    trigger={<DashedButton color='green'>Bot Response</DashedButton>}
                />
            )}
            { action && (
                <ActionPopupContent
                    onSelect={a => onSelectAction(a)}
                    trigger={<DashedButton color='pink'>Action</DashedButton>}
                />
            )}
            { slot && (
                <SlotPopupContent
                    onSelect={s => onSelectSlot(s)}
                    trigger={<DashedButton color='orange'>Slot</DashedButton>}
                />
            )}
        </div>
    );
};

AddStoryLine.propTypes = {
    availableActions: PropTypes.object.isRequired,
    onCreateUtteranceFromInput: PropTypes.func,
    onCreateUtteranceFromPayload: PropTypes.func,
    onSelectResponse: PropTypes.func,
    onCreateResponse: PropTypes.func,
    onSelectAction: PropTypes.func,
    onSelectSlot: PropTypes.func,
    noButtonResponse: PropTypes.bool,
};

AddStoryLine.defaultProps = {
    onCreateUtteranceFromInput: () => {},
    onCreateUtteranceFromPayload: () => {},
    onSelectResponse: () => {},
    onCreateResponse: () => {},
    onSelectAction: () => {},
    onSelectSlot: () => {},
    noButtonResponse: false,
};

export default AddStoryLine;
