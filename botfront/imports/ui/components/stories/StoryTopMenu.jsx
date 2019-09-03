import {
    Popup, Icon, Menu, Dropdown, Label,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import 'brace/theme/github';
import 'brace/mode/text';

import ConfirmPopup from '../common/ConfirmPopup';
import { setStoryCollapsed } from '../../store/actions/actions';

const StoryTopMenu = ({
    onDelete,
    onMove,
    storyId,
    title,
    onRename,
    disabled,
    onClone,
    groupNames,
    collapsed,
    collapseStory,
    warnings,
    errors,
}) => {
    const [newTitle, setNewTitle] = useState(title);
    const [deletePopupOpened, openDeletePopup] = useState(false);
    const [movePopupOpened, openMovePopup] = useState(false);
    const [moveDestination, setMoveDestination] = useState(null);

    const submitTitleInput = () => {
        if (title === newTitle) {
            return;
        }
        if (!newTitle.replace(/\s/g, '').length) {
            setNewTitle(title);
            return;
        }
        onRename(newTitle);
    };

    const handleInputKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            event.target.blur();
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            setNewTitle(title);
            event.target.blur();
            onRename(title);
        }
    };

    const renderWarnings = () => {
        const pluralize = warnings > 1 ? 's' : '';
        if (warnings <= 0) {
            return <></>;
        }
        return (
            <Label className='exception-label' color='yellow'>
                <Icon name='exclamation circle' />
                {warnings} Warning{pluralize}
            </Label>
        );
    };

    const renderErrors = () => {
        const pluralize = errors > 1 ? 's' : '';
        if (errors <= 0) {
            return <></>;
        }
        return (
            <Label className='exception-label' color='red'>
                <Icon name='times circle' />
                {errors} Error{pluralize}
            </Label>
        );
    };

    return (
        <Menu attached='top' className={`${collapsed ? 'collapsed' : ''}`}>
            <Menu.Item header>
                <Icon
                    name='triangle right'
                    className={`${collapsed ? '' : 'opened'}`}
                    link
                    onClick={() => {
                        collapseStory(storyId, !collapsed);
                    }}
                    data-cy='collapse-story-button'
                />
                <span className='story-title-prefix'>##</span>
                <input
                    data-cy='story-title'
                    value={newTitle}
                    onChange={event => setNewTitle(event.target.value.replace('_', ''))}
                    onKeyDown={handleInputKeyDown}
                    onBlur={submitTitleInput}
                    disabled={disabled}
                />
            </Menu.Item>
            <Menu.Item position='right'>
                {renderWarnings()}
                {renderErrors()}
                <Popup
                    trigger={<Icon name='dolly' color='grey' link data-cy='move-story' />}
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
                    trigger={
                        <Icon name='trash' color='grey' link data-cy='delete-story' />
                    }
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
    storyId: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    onRename: PropTypes.func.isRequired,
    onClone: PropTypes.func.isRequired,
    groupNames: PropTypes.array.isRequired,
    collapsed: PropTypes.bool.isRequired,
    collapseStory: PropTypes.func.isRequired,
    warnings: PropTypes.number.isRequired,
    errors: PropTypes.number.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
    collapsed: state.stories.getIn(['storiesCollapsed', ownProps.storyId], false),
});

const mapDispatchToProps = {
    collapseStory: setStoryCollapsed,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(StoryTopMenu);
