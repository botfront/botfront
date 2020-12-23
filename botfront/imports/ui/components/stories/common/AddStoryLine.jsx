import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Input } from 'semantic-ui-react';
import BotResponsePopupContent from './BotResponsePopupContent';
import ActionPopupContent from './ActionPopupContent';
import SlotPopupContent from './SlotPopupContent';
import DashedButton from './DashedButton';
import UserUtterancePopupContent from './UserUtterancePopupContent';
import { ConversationOptionsContext } from '../Context';

const AddStoryLine = React.forwardRef((props, ref) => {
    const {
        availableActions: {
            userUtterance,
            botUtterance,
            action,
            slot,
            loopActive,
            loopActivate,
        },
        noButtonResponse,
        onSelectResponse,
        onCreateResponse,
        onCreateGenericLine, // can be an array of lines
        onCreateUtteranceFromInput,
        onCreateUtteranceFromPayload,
        size,
        onBlur,
        trackOpenMenu,
    } = props;
    const [loopMenuOpen, setLoopMenuOpen] = useState(false);
    const [actionName, setActionName] = useState('');
    const { forms = [] } = useContext(ConversationOptionsContext);

    const handleCreateLoopLines = (name = null, activate) => {
        if (typeof name === 'string' && !name.trim()) return;
        const lines = [{ active_loop: name }];
        if (activate) lines.unshift({ action: name });
        onCreateGenericLine(lines);
        setActionName('');
        setLoopMenuOpen(false);
    };

    const handleClosingKeyPress = activate => (e) => {
        if (e.key === 'Enter') handleCreateLoopLines(actionName, activate);
    };

    const renderLoopNameMenu = activate => (
        <Dropdown.Menu data-cy='loop-selection-menu'>
            <Dropdown.Header>By name</Dropdown.Header>
            <Dropdown.Item>
                <Input
                    autoFocus
                    placeholder='Type in loop action name...'
                    data-cy='enter-loop-name'
                    onClick={e => e.stopPropagation()}
                    value={actionName}
                    onChange={({ target }) => setActionName(target.value.trim())}
                />
            </Dropdown.Item>
            {!!forms.length && (
                <>
                    <Dropdown.Divider />
                    <Dropdown.Header>Or select a form</Dropdown.Header>
                    {forms.map(f => (
                        <Dropdown.Item
                            key={`formname-${f.name}`}
                            content={f.name}
                            onClick={() => handleCreateLoopLines(f.name, activate)}
                        />
                    ))}
                </>
            )}
        </Dropdown.Menu>
    );

    const renderLoopMenu = () => (
        <Dropdown.Menu onClose={() => setActionName('')}>
            {loopActivate && (
                <Dropdown.Item className='dropdown'>
                    <Dropdown
                        open={loopMenuOpen === 'activate'}
                        onOpen={() => setLoopMenuOpen('activate')}
                        text='Activate loop'
                        fluid
                        data-cy='activate-loop'
                        closeOnBlur={false}
                        onClose={handleClosingKeyPress(true)}
                    >
                        {renderLoopNameMenu(true)}
                    </Dropdown>
                </Dropdown.Item>
            )}
            <Dropdown.Item className='dropdown'>
                <Dropdown
                    open={loopMenuOpen === 'active'}
                    onOpen={() => setLoopMenuOpen('active')}
                    text='Active loop'
                    fluid
                    data-cy='active-loop'
                    closeOnBlur={false}
                    onClose={handleClosingKeyPress(false)}
                >
                    {renderLoopNameMenu(false)}
                </Dropdown>
            </Dropdown.Item>
            <Dropdown.Item
                content='No active loop'
                onClick={() => handleCreateLoopLines()}
                data-cy='no-active-loop'
            />
        </Dropdown.Menu>
    );

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
                    onSelect={({ name, slotValue }) => onCreateGenericLine({ slot_was_set: [{ [name]: slotValue }] })
                    }
                    trigger={(
                        <DashedButton color='orange' size={size} data-cy='add-slot-line'>
                            Slot
                        </DashedButton>
                    )}
                    trackOpenMenu={trackOpenMenu}
                    excludedSlotsOfType={['unfeaturized']}
                />
            )}
            {loopActive && (
                <Dropdown
                    trigger={(
                        <DashedButton
                            color='botfront-blue'
                            size={size}
                            data-cy='add-loop-line'
                        >
                            Loop
                        </DashedButton>
                    )}
                    className='dropdown-button-trigger'
                    open={!!loopMenuOpen}
                    onOpen={() => {
                        setLoopMenuOpen('main');
                        trackOpenMenu(() => setLoopMenuOpen(false));
                    }}
                    onClose={() => setLoopMenuOpen(false)}
                >
                    {renderLoopMenu()}
                </Dropdown>
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
