import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';
import BotResponsePopupContent from './BotResponsePopupContent';
import ActionPopupContent from './ActionPopupContent';
import SlotPopupContent from './SlotPopupContent';
import DashedButton from './DashedButton';
import UserUtterancePopupContent from './UserUtterancePopupContent';
import { ConversationOptionsContext } from '../Context';

const AddStoryLine = React.forwardRef((props, ref) => {
    const {
        availableActions: {
            userUtterance, botUtterance, action, slot, form,
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
    const [formMenuOpen, setFormMenuOpen] = useState(false);
    const { forms = [] } = useContext(ConversationOptionsContext);

    const renderFormSelector = start => (
        <Dropdown.Menu>
            <Dropdown.Header>Select a form</Dropdown.Header>
            {forms.length
                ? forms.map(f => (
                    <Dropdown.Item
                        key={`formname-${f.name}`}
                        content={f.name}
                        onClick={() => {
                            if (start) { // reverse order, since insertion index doesn't change
                                onCreateGenericLine({
                                    type: 'form',
                                    data: { name: f.name },
                                });
                            }
                            onCreateGenericLine({
                                type: 'form_decl',
                                data: { name: f.name },
                            });
                        }}
                    />
                )) : (
                    <Dropdown.Item
                        content='No form found for this project.'
                        disabled
                    />
                )
            }
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
            {form && (
                <Dropdown
                    trigger={(
                        <DashedButton
                            color='botfront-blue'
                            size={size}
                            data-cy='add-form-line'
                        >
                            Form
                        </DashedButton>
                    )}
                    className='dropdown-button-trigger'
                    open={formMenuOpen}
                    onOpen={() => {
                        setFormMenuOpen(true);
                        trackOpenMenu(() => setFormMenuOpen(false));
                    }}
                    onClose={() => setFormMenuOpen(false)}
                >
                    <Dropdown.Menu>
                        <Dropdown.Item className='dropdown'>
                            <Dropdown
                                text='Start a form'
                                fluid
                                data-cy='start-form'
                            >
                                {renderFormSelector(true)}
                            </Dropdown>
                        </Dropdown.Item>
                        <Dropdown.Item className='dropdown'>
                            <Dropdown
                                text='Continue a form'
                                fluid
                                data-cy='continue-form'
                            >
                                {renderFormSelector(false)}
                            </Dropdown>
                        </Dropdown.Item>
                        <Dropdown.Item
                            content='Pick up after completion'
                            onClick={() => onCreateGenericLine({
                                type: 'form',
                                data: { name: null },
                            })
                            }
                            data-cy='complete-form'
                        />
                        <Dropdown.Item
                            content='Deactivate any form'
                            onClick={() => onCreateGenericLine({
                                type: 'action',
                                data: { name: 'action_deactivate_form' },
                            })
                            }
                            data-cy='deactivate-form'
                        />
                    </Dropdown.Menu>
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
