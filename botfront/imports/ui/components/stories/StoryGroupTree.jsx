import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Icon, Menu, Input, Confirm, Popup,
} from 'semantic-ui-react';
import Tree from '@atlaskit/tree';
import { useStoryGroupTree } from './hooks/useStoryGroupTree';

export default function StoryGroupTree(props) {
    const { tree: treeFromProps, onChangeActiveStory, activeStory } = props;
    const [newTitle, setNewTitle] = useState(null);
    const [deletionModalVisible, setDeletionModalVisible] = useState(false);
    const [renamingModalPosition, setRenamingModalPosition] = useState(null);
    const {
        tree,
        somethingIsDragging,
        onToggleFocus,
        onToggleExpansion,
        onExpand,
        onCollapse,
        onDragEnd,
        onDragStart,
        onRemoveItem,
        onRenameItem,
        onAddGroup,
        onAddStory,
    } = useStoryGroupTree(treeFromProps);
    const renamerRef = useRef();

    useEffect(() => {
        if (!renamingModalPosition) setNewTitle(null);
        if (!!renamingModalPosition) setNewTitle(renamingModalPosition.data.title);
    }, [!!renamingModalPosition]);

    const trimLong = string => (string.length > 50
        ? `${string.substring(0, 48)}...`
        : string);

    const getIcon = item => (
        item.data.canBearChildren
            ? (
                <Icon
                    name={`chevron circle ${item.isExpanded ? 'down' : 'up'}`}
                    onClick={() => onToggleExpansion(item)}
                    className='cursor pointer'
                />
            )
            : null
    );

    const submitNameChange = () => {
        if (newTitle.trim()) onRenameItem(renamingModalPosition.id, newTitle.trim());
        setRenamingModalPosition(null);
    };

    const handleKeyDownInput = (e) => {
        if (e.key === 'Enter') submitNameChange();
        if (e.key === 'Escape') setRenamingModalPosition(null);
    };

    const renderItem = (renderProps) => {
        const {
            item, provided, snapshot: { combineTargetFor, isDragging },
        } = renderProps;
        const isLeaf = !item.data.canBearChildren;
        const { isFocused } = item.data;
        const isBeingRenamed = (renamingModalPosition || {}).id === item.id;
        const isHoverTarget = combineTargetFor && !isLeaf;
        const style = isLeaf
            ? { width: 'calc(100% - 70px)' }
            : { width: 'calc(100% - 110px)' };
        return (
            <div
                ref={provided.innerRef}
                {...provided.draggableProps}
            >
                <Menu.Item
                    active={item.id === activeStory.id || isHoverTarget}
                    {...(isLeaf ? { onClick: () => onChangeActiveStory(item) } : {})}
                >
                    <div className='side-by-side narrow middle'>
                        <Icon
                            name='bars'
                            size='small'
                            color='grey'
                            className={`drag-handle ${isDragging ? 'dragging' : ''}`}
                            {...provided.dragHandleProps}
                            {...(item.isExpanded
                                ? { onMouseDown: (...args) => { onCollapse(item.id); provided.dragHandleProps.onMouseDown(...args); } }
                                : {}
                            )}
                        />
                        <div className='side-by-side left narrow' style={style}>
                            <div className='item-chevron'>{getIcon(item)}</div>
                            {isBeingRenamed ? (
                                <Input
                                    onChange={(_, { value }) => setNewTitle(value)}
                                    value={newTitle}
                                    onKeyDown={handleKeyDownInput}
                                    autoFocus
                                    onBlur={submitNameChange}
                                    data-cy='edit-name'
                                    className='item-edit-box'
                                />
                            )
                                : (
                                    <span
                                        className='item-name'
                                        onDoubleClick={() => setRenamingModalPosition(item)}
                                        {...(isBeingRenamed ? { ref: renamerRef } : {})}
                                    >
                                        {trimLong(item.data.title)}
                                    </span>
                                )}
                        </div>
                        <div className='item-actions'>
                            {!isLeaf && (
                                <>
                                    <Icon
                                        className={`cursor pointer ${isFocused ? 'focused' : ''}`}
                                        name='eye'
                                        onClick={(e) => { e.stopPropagation(); onToggleFocus(item.id); }}
                                    />
                                    <Icon
                                        className='cursor pointer'
                                        name='plus'
                                        onClick={() => onAddStory(item.id, `${item.data.title}-s${item.children.length}`)}
                                    />
                                </>
                            )}
                            <Icon
                                className='cursor pointer'
                                name='trash'
                                onClick={() => setDeletionModalVisible(item)}
                            />
                        </div>
                    </div>
                </Menu.Item>
            </div>
        );
    };

    return (
        <div className='storygroup-browser'>
            <Confirm
                open={!!deletionModalVisible}
                className='warning'
                header='Warning!'
                confirmButton='Delete'
                content={
                    (deletionModalVisible.data || {}).canBearChildren
                        ? `The story group ${(deletionModalVisible.data || {}).title
                        } and all its stories in it will be deleted. This action cannot be undone.`
                        : `The story ${(deletionModalVisible.data || {}).title
                        } will be deleted. This action cannot be undone.`
                }
                onCancel={() => setDeletionModalVisible(false)}
                onConfirm={() => { onRemoveItem(deletionModalVisible.id); setDeletionModalVisible(false); }}
            />
            {/* <Popup
                open={typeof newTitle === 'string'}
                tabIndex={0}
                wide
                on='click'
                context={renamerRef.current}
                onClose={() => setRenamingModalPosition(null)}
            >
                <Input
                    onChange={(_, { value }) => setNewTitle(value)}
                    value={newTitle}
                    onKeyDown={handleKeyDownInput}
                    autoFocus
                    onBlur={submitNameChange}
                    data-cy='edit-name'
                />
            </Popup> */}
            <Menu pointing secondary vertical className={somethingIsDragging ? 'dragging' : ''}>
                <Tree
                    tree={tree}
                    renderItem={renderItem}
                    onExpand={onExpand}
                    onCollapse={onCollapse}
                    onDragEnd={onDragEnd}
                    onDragStart={onDragStart}
                    offsetPerLevel={0}
                    isDragEnabled
                    isNestingEnabled
                />
            </Menu>
        </div>
    );
}

StoryGroupTree.propTypes = {
    tree: PropTypes.object.isRequired,
    onChangeActiveStory: PropTypes.func.isRequired,
    activeStory: PropTypes.string,
};

StoryGroupTree.defaultProps = {
    activeStory: null,
};
