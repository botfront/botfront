import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Icon, Menu, Input, Popup,
} from 'semantic-ui-react';

const StoryGroupTreeNode = (props) => {
    const {
        item,
        provided,
        snapshot: { combineTargetFor, isDragging },
        somethingIsMutating,
        activeStories,
        handleMouseDownInMenu,
        handleMouseEnterInMenu,
        setDeletionModalVisible,
        handleToggleExpansion,
        handleCollapse,
        handleAddStory,
        handleToggleFocus,
        handleRenameItem,
        handleTogglePublish,
        selectionIsNonContiguous,
        disabled,
        showPublish,
    } = props;
    const { type } = item;
    const [newTitle, setNewTitle] = useState('');
    const [renamingModalPosition, setRenamingModalPosition] = useState(null);
    const renamerRef = useRef();

    const isSmartNode = !!item.id.match(/^.*_SMART_/);

    const trimLong = string => (string.length > 50 ? `${string.substring(0, 48)}...` : string);
    const isInSelection = activeStories.includes(item.id);
    const disableEdit = disabled || isSmartNode || item.smartGroup || type === 'form-slot';
    const disableDrag = disabled
        || isSmartNode
        || (selectionIsNonContiguous && activeStories.includes(item.id))
        || type === 'form-slot';

    const icon = ['story-group', 'form'].includes(type) ? (
        <Icon
            name={`caret ${item.isExpanded ? 'down' : 'right'}`}
            {...(!somethingIsMutating
                ? {
                    onClick: () => handleToggleExpansion(item),
                    onMouseDown: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    },
                }
                : {})}
            className='cursor pointer'
            data-cy='toggle-expansion-story-group'
        />
    ) : null;

    const submitNameChange = () => {
        if (newTitle.trim()) handleRenameItem(renamingModalPosition.id, newTitle.trim());
        setRenamingModalPosition(null);
    };

    const handleKeyDownInput = (e) => {
        if (e.key === 'Enter') submitNameChange();
        if (e.key === 'Escape') setRenamingModalPosition(null);
    };

    const isPublished = item.status && item.status === 'published';
    const { selected: isFocused } = item;
    const isBeingRenamed = (renamingModalPosition || {}).id === item.id;
    const isHoverTarget = combineTargetFor && type === 'story-group';

    useEffect(() => {
        if (!renamingModalPosition) setNewTitle('');
        if (!!renamingModalPosition) setNewTitle(renamingModalPosition.title);
    }, [!!renamingModalPosition]);

    const handleProps = !somethingIsMutating && !disableDrag
        ? {
            ...provided.dragHandleProps,
            onMouseDown: (e, ...args) => {
                e.preventDefault();
                e.stopPropagation();
                if (item.isExpanded) handleCollapse(item.id);
                provided.dragHandleProps.onMouseDown(e, ...args);
            },
        }
        : {
            // otherwise beautiful-dnd throws
            'data-react-beautiful-dnd-drag-handle':
                provided.dragHandleProps['data-react-beautiful-dnd-drag-handle'],
        };

    const tooltipWrapper = (trigger, tooltip) => (
        <Popup size='mini' inverted content={tooltip} trigger={trigger} />
    );

    const cleanStoryId = id => id.replace(/^.*_SMART_/, '');
    

    const renderItemActions = () => (
        <div className={`item-actions ${disabled ? 'hidden' : ''}`}>
            {!disableEdit && !isBeingRenamed && (
                <i>
                    {type === 'story-group' && (
                        <>
                            {tooltipWrapper(
                                <Icon
                                    className={`cursor pointer ${
                                        isFocused ? 'focused' : ''
                                    }`}
                                    data-cy='focus-story-group'
                                    name='eye'
                                    {...(!somethingIsMutating
                                        ? {
                                            onClick: () => handleToggleFocus(item.id),
                                            onMouseDown: (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            },
                                        }
                                        : {})}
                                />,
                                'Focus story group',
                            )}
                            {tooltipWrapper(
                                <Icon
                                    className='cursor pointer'
                                    data-cy='add-story-in-story-group'
                                    name='plus'
                                    {...(!somethingIsMutating
                                        ? {
                                            onClick: () => handleAddStory(
                                                item.id,
                                                `${item.title} (${
                                                    item.children.length + 1
                                                })`,
                                                showPublish ? 'unpublished' : 'published',
                                            ),
                                            onMouseDown: (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            },
                                        }
                                        : {})}
                                />,
                                'Add new story to group',
                            )}
                        </>
                    )}
                    <Icon
                        className='cursor pointer'
                        data-cy='delete-story-group'
                        name='trash'
                        {...(!somethingIsMutating
                            ? {
                                onClick: () => setDeletionModalVisible(item),
                                onMouseDown: (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                },
                            }
                            : {})}
                    />
                </i>
            )}
            { isLeaf && showPublish && !disabled && (
                <Popup
                    content={<p>This story is unpublished and is only trained in the development environment</p>}
                    trigger={(
                        <Icon
                            className='cursor pointer'
                            data-cy='toggle-publish'
                            name={isPublished ? 'toggle on' : 'toggle off'}
                            onClick={() => { handleTogglePublish(cleanStoryId(item.id)); }}
                        />
                    )}
                    inverted
                    on='hover'
                    disabled={isPublished}
                />
            )}
        </div>
    );


    return (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            tabIndex={0} // eslint-disable-line jsx-a11y/no-noninteractive-tabindex
            className={`item-focus-holder ${item.smartGroup ? 'blue' : ''}`}
            id={`story-menu-item-${item.id}`}
            type={type}
            data-pinned={!!item.pinned}
            data-cy='story-group-menu-item'
        >
            <Menu.Item
                active={isInSelection || isHoverTarget}
                {...(type !== 'story-group' ? {
                    onMouseDown: ({ nativeEvent: { shiftKey } }) => {
                        handleMouseDownInMenu({ item, shiftKey });
                    },
                    onMouseEnter: () => handleMouseEnterInMenu({ item }),
                } : {})}
            >
                <div
                    className='side-by-side left narrow middle'
                    {...(isBeingRenamed ? { ref: renamerRef } : {})}
                >
                    <Icon
                        name='bars'
                        size='small'
                        color='grey'
                        className={`drag-handle ${isDragging ? 'dragging' : ''} ${
                            disableDrag ? 'hidden' : ''
                        }`}
                        {...handleProps}
                    />
                    <div className='item-chevron'>{icon}</div>
                    {isBeingRenamed ? (
                        <Input
                            onChange={(_, { value }) => setNewTitle(value)}
                            value={newTitle}
                            onKeyDown={handleKeyDownInput}
                            autoFocus
                            onBlur={submitNameChange}
                            data-cy='edit-name'
                            className='item-edit-box'
                            {...(renamerRef.current
                                ? {
                                    style: {
                                        width: `${
                                            renamerRef.current.clientWidth - 25
                                        }px`,
                                    },
                                }
                                : {})}
                        />
                    ) : (
                        <span
                            className={`item-name ${
                                somethingIsMutating || disableEdit ? 'uneditable' : ''
                            } ${!isPublished && showPublish ? 'grey' : ''}`}
                            {...(!(somethingIsMutating || disableEdit)
                                ? { onDoubleClick: () => setRenamingModalPosition(item) }
                                : {})}
                        >
                            {trimLong(item.title)}
                        </span>
                    )}
                    {renderItemActions()}
                </div>
            </Menu.Item>
        </div>
    );
};

StoryGroupTreeNode.propTypes = {
    item: PropTypes.object.isRequired,
    provided: PropTypes.object.isRequired,
    snapshot: PropTypes.object.isRequired,
    somethingIsMutating: PropTypes.bool.isRequired,
    activeStories: PropTypes.array.isRequired,
    handleMouseDownInMenu: PropTypes.func.isRequired,
    handleMouseEnterInMenu: PropTypes.func.isRequired,
    setDeletionModalVisible: PropTypes.func.isRequired,
    handleToggleExpansion: PropTypes.func.isRequired,
    handleCollapse: PropTypes.func.isRequired,
    handleAddStory: PropTypes.func.isRequired,
    handleToggleFocus: PropTypes.func.isRequired,
    handleRenameItem: PropTypes.func.isRequired,
    handleTogglePublish: PropTypes.func.isRequired,
    selectionIsNonContiguous: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
    showPublish: PropTypes.bool,
};

StoryGroupTreeNode.defaultProps = {
    disabled: false,
    showPublish: true,
};

const StoryGroupTreeNodeWrapped = props => <StoryGroupTreeNode {...props} />;

export default StoryGroupTreeNodeWrapped;
