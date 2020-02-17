import {
    Popup, Icon, Menu, Dropdown, Label, Message, Header,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import 'brace/theme/github';
import 'brace/mode/text';

import ConfirmPopup from '../common/ConfirmPopup';
import ToolTipPopup from '../common/ToolTipPopup';
import StoryRulesEditor from './rules/StoryRulesEditor';
import { setStoryCollapsed } from '../../store/actions/actions';
import StoryPlayButton from './StoryPlayButton';

import { ConversationOptionsContext } from './Context';
import { can } from '../../../api/roles/roles';

const StoryTopMenu = ({
    onDelete,
    onMove,
    storyId,
    title,
    onRename,
    disabled,
    // onClone, the story duplication is deactivated for now, it may cause issues with response edition
    groupNames,
    collapsed,
    collapseStory,
    warnings: warningDetails,
    errors: errorDetails,
    isDestinationStory,
    originStories,
    isLinked,
    rules,
    isInSmartStories,
    initPayload,
    collapseAllStories,
    projectId,
}) => {
    const errors = errorDetails.length;
    const warnings = warningDetails.length;

    const [newTitle, setNewTitle] = useState(title);
    const [deletePopupOpened, openDeletePopup] = useState(false);
    const [movePopupOpened, openMovePopup] = useState(false);
    const [moveDestination, setMoveDestination] = useState(null);
    const [triggerEditorOpen, setTriggerEditorOpen] = useState(false);

    const { stories, storyGroups } = useContext(ConversationOptionsContext);

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
            <Label
                className='exception-label'
                color='yellow'
                data-cy='top-menu-warning-alert'
            >
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
            <Label className='exception-label' color='red' data-cy='top-menu-error-alert'>
                <Icon name='times circle' />
                {errors} Error{pluralize}
            </Label>
        );
    };

    const renderConnectedStories = () => {
        const storyGroupIdDictionary = {};

        storyGroups.forEach((storyGroup) => {
            storyGroupIdDictionary[storyGroup._id] = storyGroup.name;
        });

        const storyIdDictionary = {};
        stories.forEach((story) => {
            storyIdDictionary[story._id] = {
                storyGroupId: story.storyGroupId,
                title: story.title,
            };
        });
        const connectedStories = {};
        originStories.forEach((path, index) => {
            if (!Array.isArray(path) || storyIdDictionary[path[0]] === undefined) {
                return;
            }
            const story = storyIdDictionary[path[0]];
            if (connectedStories[story.storyGroupId] === undefined) {
                connectedStories[story.storyGroupId] = [];
            }
            connectedStories[story.storyGroupId] = [
                ...connectedStories[story.storyGroupId],
                <p key={index} className='title-list-elem'>
                    <span className='story-title-prefix'>##</span>
                    {story.title}
                </p>,
            ];
        });
        return Object.keys(connectedStories).map(key => (
            <React.Fragment key={storyGroupIdDictionary[key]}>
                <Header>
                    {storyGroupIdDictionary[key]}
                </Header>
                {connectedStories[key]}
            </React.Fragment>
        ));
    };

    const renderDeletePopup = () => {
        let toolTipText = [];
        if (isDestinationStory) {
            toolTipText = [
                ...toolTipText,
                'A story that is the destination of a link in another story cannot be deleted.',
            ];
        }
        if (isLinked) {
            toolTipText = [
                ...toolTipText,
                'A story that is linked to another story cannot be deleted.',
            ];
        }
        if (isInSmartStories) {
            toolTipText = [
                'To delete this story, open it in it\'s original group.',
            ];
        }
        return isLinked || isDestinationStory || isInSmartStories ? (
            <ToolTipPopup
                trigger={(
                    <Icon
                        disabled={isDestinationStory || isLinked || isInSmartStories || !can('stories:w', projectId)}
                        name='trash'
                        data-cy='delete-story'
                        className='top-menu-clickable'
                    />
                )}
                toolTipText={toolTipText}
                header='This story cannot be deleted'
            />
        ) : (
            <Popup
                trigger={(
                    <Icon
                        disabled={isDestinationStory || isLinked || !can('stories:w', projectId)}
                        name='trash'
                        data-cy='delete-story'
                        className='top-menu-clickable'
                    />
                )}
                disabled={isDestinationStory || isLinked}
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
        );
    };

    return (
        <>
            <Menu
                attached='top'
                data-cy='story-top-menu'
                className={`${collapsed ? 'collapsed' : ''}`}
            >
                <Menu.Item header>
                    <Icon
                        name='triangle right'
                        className={`${collapsed ? '' : 'opened'}`}
                        link
                        onClick={() => {
                            collapseStory(storyId, !collapsed);
                        }}
                        onDoubleClick={() => {
                            collapseAllStories(!collapsed);
                        }}
                        data-cy='collapse-story-button'
                    />
                    {isDestinationStory ? (
                        <Icon name='arrow alternate circle right' color='green' fitted />
                    ) : (
                        <span className='story-title-prefix'>##</span>
                    )}
                    <input
                        data-cy='story-title'
                        value={newTitle}
                        onChange={event => setNewTitle(event.target.value.replace('_', ''))
                        }
                        onKeyDown={handleInputKeyDown}
                        onBlur={submitTitleInput}
                        disabled={disabled || !can('stories:w', projectId)}
                    />
                </Menu.Item>
                <Menu.Item position='right'>
                    {renderWarnings()}
                    {renderErrors()}
                    <StoryRulesEditor
                        // the trigger element will have it's onClick, disabled, and className props modified
                        trigger={(
                            
                            <Icon
                                name='stopwatch'
                                color={(() => {
                                    if (errorDetails.some(({ code }) => code === 'smart_story_payload')) return 'red';
                                    return rules && rules.length ? 'green' : 'grey';
                                })()}
                                data-cy='edit-trigger-rules'
                            />
                        )}
                        storyId={storyId}
                        rules={rules}
                        open={triggerEditorOpen}
                        setOpen={setTriggerEditorOpen}
                        isDestinationStory={isDestinationStory}
                    />
                    <StoryPlayButton
                        initPayload={initPayload}
                        className='top-menu-clickable'
                    />
                    <Popup
                        trigger={(
                            <div>
                                <Popup
                                    disabled={!isInSmartStories}
                                    trigger={(
                                        <div>
                                            <Icon name='dolly' data-cy='move-story' disabled={isInSmartStories || !can('stories:w', projectId)} className='move-icon' />
                                        </div>
                                    )}
                                    header='This story cannot be moved'
                                    content={'To move this story, open it in it\'s original group.'}
                                />
                            </div>
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
                        disabled={isInSmartStories || !can('stories:w', projectId)}
                        on='click'
                        open={movePopupOpened}
                        onOpen={() => openMovePopup(true)}
                        onClose={() => openMovePopup(false)}
                    />
                    { /*
                        the story duplication is deactivated for now, it may cause issues with response edition
                        <Icon
                        name='clone'
                        color='grey'
                        link
                        data-cy='duplicate-story'
                        onClick={onClone}
                    /> */}
                    {renderDeletePopup()}
                </Menu.Item>
            </Menu>
            {isDestinationStory && (
                <Popup
                    className='connected-stories-popup'
                    size='small'
                    on='click'
                    position='bottom left'
                    trigger={(
                        <Message
                            className='connected-story-alert'
                            attached
                            warning
                            size='tiny'
                            data-cy='connected-to'
                        >
                            <Icon name='info circle' />
                            There are one or more stories linked to this story. You can
                            only delete it after unlinking all stories.
                        </Message>
                    )}
                >
                    {renderConnectedStories()}
                </Popup>
            )}
            { rules && rules.length > 0 && (
                <Message
                    className='connected-story-alert'
                    attached
                    warning
                    size='tiny'
                    onClick={() => setTriggerEditorOpen(true)}
                >
                    <Icon name='info circle' />
                    This story will be triggered automatically when the conditions set with the stopwatch icon are met.
                </Message>
            )}
        </>
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
    warnings: PropTypes.array.isRequired,
    errors: PropTypes.array.isRequired,
    isDestinationStory: PropTypes.bool.isRequired,
    originStories: PropTypes.array.isRequired,
    isLinked: PropTypes.bool,
    rules: PropTypes.array,
    isInSmartStories: PropTypes.bool,
    initPayload: PropTypes.string,
    collapseAllStories: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
};

StoryTopMenu.defaultProps = {
    isDestinationStory: false,
    isLinked: false,
    originStories: [],
    rules: [],
    isInSmartStories: false,
    initPayload: null,
};

const mapStateToProps = (state, ownProps) => ({
    collapsed: state.stories.getIn(['storiesCollapsed', ownProps.storyId], false),
    projectId: state.settings.get('projectId'),
});

const mapDispatchToProps = {
    collapseStory: setStoryCollapsed,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(StoryTopMenu);
