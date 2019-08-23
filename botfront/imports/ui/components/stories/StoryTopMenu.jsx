import {
    Popup, Icon, Menu, Dropdown,
} from 'semantic-ui-react';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import 'brace/theme/github';
import 'brace/mode/text';

import ConfirmPopup from '../common/ConfirmPopup';

const StoryTopMenu = ({
    onDelete,
    onMove,
    title,
    onRename,
    disabled,
    onClone,
    groupNames,
}) => {
    const [newTitle, setNewTitle] = useState(title);
    const [deletePopupOpened, openDeletePopup] = useState(false);
    const [movePopupOpened, openMovePopup] = useState(false);
    const [moveDestination, setMoveDestination] = useState(null);
    return (
        <Menu attached='top'>
            <Menu.Item header>
                <span className='story-title-prefix'>##</span>
                <input
                    data-cy='story-title'
                    value={newTitle}
                    onChange={event => setNewTitle(event.target.value)}
                    onBlur={() => {
                        if (title === newTitle) {
                            return;
                        }
                        if (!newTitle.replace(/\s/g, '').length) {
                            setNewTitle(title);
                            return;
                        }
                        onRename(newTitle);
                    }}
                    disabled={disabled}
                />
            </Menu.Item>
            <Menu.Item position='right'>
                <Popup
                    trigger={(
                        <Icon
                            name='dolly'
                            color='grey'
                            link
                            data-cy='move-story'
                        />
                    )}
                    content={(
                        <ConfirmPopup
                            title='Move story to :'
                            content={(
                                <Dropdown
                                    button
                                    openOnFocus
                                    search
                                    basic
                                    placeholder='Select a group'
                                    fluid
                                    selection
                                    value={moveDestination}
                                    options={groupNames}
                                    onChange={(e, data) => {
                                        setMoveDestination(data.value);
                                    }}
                                    data-cy='move-story-dropdown'
                                />
                            )}
                            onYes={() => {
                                if (moveDestination) {
                                    openMovePopup(false);
                                    onMove(moveDestination);
                                }
                            }}
                            onNo={() => openMovePopup(false)}
                        />
                    )}
                    on='click'
                    open={movePopupOpened}
                    onOpen={() => openMovePopup(true)}
                    onClose={() => openMovePopup(false)}
                />
                <Icon
                    name='clone'
                    color='grey'
                    link
                    data-cy='duplicate-story'
                    onClick={onClone}
                />
                <Popup
                    trigger={(
                        <Icon
                            name='trash'
                            color='grey'
                            link
                            data-cy='delete-story'
                        />
                    )}
                    content={(
                        <ConfirmPopup
                            title='Delete story ?'
                            onYes={() => {
                                openDeletePopup(false);
                                onDelete();
                            }}
                            onNo={() => openDeletePopup(false)}
                        />
                    )}
                    on='click'
                    open={deletePopupOpened}
                    onOpen={() => openDeletePopup(true)}
                    onClose={() => openDeletePopup(false)}
                />
            </Menu.Item>
        </Menu>
    );
};

StoryTopMenu.propTypes = {
    title: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    onRename: PropTypes.func.isRequired,
    onClone: PropTypes.func.isRequired,
    groupNames: PropTypes.array.isRequired,
};

export default StoryTopMenu;
