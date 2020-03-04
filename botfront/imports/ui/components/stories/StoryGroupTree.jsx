import React, {
    useState, useRef, useEffect, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import {
    Icon, Menu, Input, Confirm, Popup,
} from 'semantic-ui-react';
import Tree from '@atlaskit/tree';
import { useStoryGroupTree } from './hooks/useStoryGroupTree';
import { useEventListener } from '../utils/hooks';

export default function StoryGroupTree(props) {
    const { tree: treeFromProps, onChangeActiveStories, activeStories } = props;
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
    const menuRef = useRef();

    const getSiblingsAndIndex = (story, inputTree) => {
        const { id, data: { parentId } } = story;
        const siblingIds = inputTree.items[parentId].children;
        const index = siblingIds.findIndex(c => c === id);
        return { index, siblingIds, parentId };
    };

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
                    name={`caret ${item.isExpanded ? 'down' : 'right'}`}
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

    const handleKeyDownInMenu = useCallback(({ target, key, shiftKey }) => {
        if (!menuRef.current.contains(target)) return null;
        if (!['ArrowUp', 'ArrowDown'].includes(key)) return null;
        if (!activeStories.length) return null;
        const bounds = [activeStories[0], activeStories[activeStories.length - 1]]
            .map(i => getSiblingsAndIndex(i, tree));
        const { siblingIds } = bounds[0];
        if (key === 'ArrowUp') bounds[0].index = Math.max(0, bounds[0].index - 1);
        else bounds[1].index = Math.min(siblingIds.length - 1, bounds[1].index + 1);
        if (!shiftKey) {
            const index = key === 'ArrowUp' ? bounds[0].index : bounds[1].index;
            return onChangeActiveStories([tree.items[siblingIds[index]]]);
        }
        const newActiveStoryIds = siblingIds.slice(bounds[0].index, bounds[1].index + 1);
        return onChangeActiveStories(newActiveStoryIds.map(id => tree.items[id]));
    }, [activeStories, tree]);

    const handleClickStory = useCallback(({ nativeEvent: { shiftKey } }, item) => {
        if (!shiftKey || !activeStories.length) return onChangeActiveStories([item]);
        const bounds = [activeStories[0], activeStories[activeStories.length - 1]]
            .map(i => getSiblingsAndIndex(i, tree));
        const { index, siblingIds, parentId } = getSiblingsAndIndex(item, tree);
        if (parentId !== bounds[0].parentId) return onChangeActiveStories([item]);
        if (index >= bounds[0].index && index <= bounds[1].index) return onChangeActiveStories([item]);
        const newActiveStoryIds = siblingIds.slice(Math.min(bounds[0].index, index), Math.max(bounds[1].index, index) + 1);
        return onChangeActiveStories(newActiveStoryIds.map(id => tree.items[id]));
    }, [activeStories, tree]);

    useEventListener('keydown', handleKeyDownInMenu);

    const renderItem = (renderProps) => {
        const {
            item, provided, snapshot: { combineTargetFor, isDragging },
        } = renderProps;
        const isLeaf = !item.data.canBearChildren;
        const { isFocused } = item.data;
        const isBeingRenamed = (renamingModalPosition || {}).id === item.id;
        const isHoverTarget = combineTargetFor && !isLeaf;
        const style = isLeaf
            ? { width: 'calc(100% - 70px)' } // one button
            : { width: 'calc(100% - 110px)' }; // three buttons
        return (
            <div
                ref={provided.innerRef}
                {...provided.draggableProps}
            >
                <Menu.Item
                    active={activeStories.some(s => s.id === item.id) || isHoverTarget}
                    {...(isLeaf ? { onClick: e => handleClickStory(e, item) } : {})}
                    tabIndex={0}
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
                        <div className='side-by-side left narrow' style={style} {...(isBeingRenamed ? { ref: renamerRef } : {})}>
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
                                    {...(renamerRef.current ? { style: { width: `${renamerRef.current.clientWidth - 25}px` } } : {})}
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
        <div className='storygroup-browser' ref={menuRef}>
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
    onChangeActiveStories: PropTypes.func.isRequired,
    activeStories: PropTypes.array,
};

StoryGroupTree.defaultProps = {
    activeStories: [],
};
