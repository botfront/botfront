import React from 'react';
import PropTypes from 'prop-types';
import BotResponsePopupContent from './BotResponsePopupContent';
import ActionPopupContent from './ActionPopupContent';
import SlotPopupContent from './SlotPopupContent';
import DashedButton from './DashedButton';

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
        onClickUserUtterance,
    } = props;
    return (
        <div>
            { userUtterance && (
                <DashedButton
                    color='blue'
                    onClick={onClickUserUtterance}
                >
                    User says:
                </DashedButton>
            )}
            { botUtterance && (
                <BotResponsePopupContent
                    onSelect={r => onSelectResponse(r)}
                    onCreate={r => onCreateResponse(r)}
                    noButtonResponse={noButtonResponse}
                    trigger={<DashedButton color='green'>Bot Response</DashedButton>}
                />
            )}
            { action && (
                <ActionPopupContent
                    onSelect={a => onSelectAction(a)}
                    trigger={<DashedButton color='pink'>Action</DashedButton>}
                    style={{ paddingRight: '3px' }}
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
    onClickUserUtterance: PropTypes.func,
    onSelectResponse: PropTypes.func,
    onCreateResponse: PropTypes.func,
    onSelectAction: PropTypes.func,
    onSelectSlot: PropTypes.func,
    noButtonResponse: PropTypes.bool,
};

AddStoryLine.defaultProps = {
    onClickUserUtterance: () => {},
    onSelectResponse: () => {},
    onCreateResponse: () => {},
    onSelectAction: () => {},
    onSelectSlot: () => {},
    noButtonResponse: false,
};

export default AddStoryLine;
