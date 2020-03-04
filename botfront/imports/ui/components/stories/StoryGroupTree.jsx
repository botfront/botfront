import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Icon, Menu, Input, Confirm, Popup,
} from 'semantic-ui-react';
import Tree from '@atlaskit/tree';
import { useStoryGroupTree } from './hooks/useStoryGroupTree';
import EllipsisMenu from '../common/EllipsisMenu';

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
                />
            )
            : null
            
    );

    const submitNameChange = () => {
        onRenameItem(renamingModalPosition.id, newTitle);
        setRenamingModalPosition(null);
    };

    const handleKeyDownInput = (e) => {
        if (e.key === 'Enter') submitNameChange();
        if (e.key === 'Escape') setRenamingModalPosition(null);
    };

    const onClickItem = item => (item.data.canBearChildren
        ? () => onToggleExpansion(item)
        : () => onChangeActiveStory(item));

    const renderItem = (renderProps) => {
        const {
            item, provided, snapshot: { combineTargetFor, isDragging },
        } = renderProps;
        const isHoverTarget = combineTargetFor && item.data.canBearChildren;
        return (
            <div
                ref={provided.innerRef}
                {...provided.draggableProps}
            >
                <Menu.Item
                    active={item.id === activeStory.id || isHoverTarget}
                    onClick={onClickItem(item)}
                >
                    <div className='side-by-side left middle narrow'>
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
                        <div
                            className='side-by-side left narrow width'
                            {...((renamingModalPosition || {}).id === item.id ? { ref: renamerRef } : {})}
                        >
                            <div style={{ width: '20px' }}>{getIcon(item)}</div>
                            <span className='item-name'>{trimLong(item.data.title)}</span>
                        </div>
                        {item.data.canBearChildren && (
                            <div style={{ position: 'relative', left: '10px' }}>
                                <Icon
                                    className={`${item.data.isFocused ? 'focused' : ''} ${item.data.canBearChildren ? '' : 'hidden'}`}
                                    name='eye'
                                    onClick={(e) => { e.stopPropagation(); onToggleFocus(item.id); }}
                                />
                                <EllipsisMenu
                                    onClick={() => {}}
                                    handleEdit={() => setRenamingModalPosition(item)}
                                    handleDelete={() => setDeletionModalVisible(item.id)}
                                    onAdd={() => onAddStory(item.id, `${item.data.title}-s${item.children.length}`)}
                                    deletable={item.data.canBeDeleted || item.data.canBeDeleted === undefined}
                                />
                            </div>
                        )}
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
                content={`The story group ${
                    deletionModalVisible && tree.items[deletionModalVisible].data.title
                } and all its stories in it will be deleted. This action cannot be undone.`}
                onCancel={() => setDeletionModalVisible(false)}
                onConfirm={() => { onRemoveItem(deletionModalVisible); setDeletionModalVisible(false); }}
            />
            <Popup
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
            </Popup>
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
