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
            userUtterance, botUtterance, action, slot, ellipsis,
        },
        type,
        noButtonResponse,
        onSelectResponse,
        onCreateResponse,
        onCreateGenericLine,
        onCreateEllipsisLine,
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
                    onSelect={a => onCreateGenericLine({
                        type: 'action',
                        data: { name: a },
                    })
                    }
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
                    onSelect={s => onCreateGenericLine({ type: 'slot', data: s })}
                    trigger={(
                        <DashedButton color='orange' size={size} data-cy='add-slot-line'>
                            Slot
                        </DashedButton>
                    )}
                    trackOpenMenu={trackOpenMenu}
                />
            )}
           
           
            {type === 'rule' && ellipsis && (
                <DashedButton onClick={() => onCreateEllipsisLine()} color='purple' size={size} data-cy='add-ellipsis-line'>
                            Ellipsis
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
    onCreateEllipsisLine: PropTypes.func,
    noButtonResponse: PropTypes.bool,
    size: PropTypes.string,
    onBlur: PropTypes.func,
    trackOpenMenu: PropTypes.func,
    type: PropTypes.string,
};

AddStoryLine.defaultProps = {
    onCreateUtteranceFromInput: () => {},
    onCreateUtteranceFromPayload: () => {},
    onSelectResponse: () => {},
    onCreateResponse: () => {},
    onCreateGenericLine: () => {},
    onCreateEllipsisLine: () => {},
    noButtonResponse: false,
    size: 'mini',
    onBlur: () => {},
    trackOpenMenu: () => {},
    type: 'story',
};

export default AddStoryLine;
