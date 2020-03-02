import React, { useReducer, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Icon, Menu, Input, Confirm,
} from 'semantic-ui-react';
import Tree, {
    getItem, getParent, mutateTree, moveItemOnTree,
} from '@atlaskit/tree';
import EllipsisMenu from '../common/EllipsisMenu';

export default function StoryGroupTree(props) {
    const { tree: treeFromProps, onChangeActiveStory, activeStory } = props;
    const [editing, setEditing] = useState(false);
    const [somethingIsDragging, setSomethingIsDragging] = useState(false);
    const [deletionModalVisible, setDeletionModalVisible] = useState(false);

    const getSourceAndDestinationNodes = (tree, source, destination) => [
        tree.items[tree.items[source.parentId].children[source.index]],
        tree.items[destination.parentId],
    ];

    const treeReducer = (tree, instruction) => {
        const {
            expand, collapse, move, remove, toggleFocus,
        } = instruction;
        if (expand) return mutateTree(tree, expand, { isExpanded: true });
        if (collapse) return mutateTree(tree, collapse, { isExpanded: false });
        if (remove) {
            const { [remove]: { children }, ...items } = tree.items;
            children.forEach((key) => { delete items[key]; });
            items[tree.rootId].children = items[tree.rootId].children
                .filter(key => key !== remove);
            return { ...tree, items };
        }
        if (toggleFocus) {
            const { data } = tree.items[toggleFocus];
            return mutateTree(tree, toggleFocus, { data: { ...data, isFocused: !data.isFocused } });
        }
        if (move) {
            const [source, requestedDestination] = move;
            let destination = requestedDestination;
            if (!destination) return tree; // no destination found

            let [sourceNode, destinationNode] = getSourceAndDestinationNodes(tree, source, destination);

            const acceptanceCriterion = sourceNode.data.canBearChildren
                ? candidateNode => candidateNode.id === tree.rootId // only move bearers to root
                : candidateNode => candidateNode.data.canBearChildren; // move leaves to first bearer
            const identityCheck = candidateNode => c => c === candidateNode.id;
            while (!acceptanceCriterion(destinationNode)) {
                const parentParentId = destinationNode.data.parentId;
                const parentParentNode = tree.items[parentParentId];
                const index = parentParentNode.children.findIndex(identityCheck(destinationNode));
                destination = { index, parentId: parentParentId };
                [sourceNode, destinationNode] = getSourceAndDestinationNodes(tree, source, destination);
            }

            if (destinationNode.id === tree.rootId && !sourceNode.data.canBearChildren) {
                // leaf moved to root
                if (!destination.index || destination.index < 1) return tree;
                const { id: parentId } = tree.items[tree.items[tree.rootId].children[destination.index - 1]];
                destination = { parentId };
            }
            
            const movedTree = mutateTree(
                moveItemOnTree(tree, source, destination),
                sourceNode.id,
                { data: { ...sourceNode.data, parentId: destination.parentId } },
            );
            return mutateTree(movedTree, destination.parentId, { isExpanded: true }); // make sure destination is open
        }
        return tree;
    };
    const [tree, setTree] = useReducer(treeReducer, treeFromProps);

    const toggleExpansion = item => setTree({ [item.isExpanded ? 'collapse' : 'expand']: item.id });

    const getIcon = item => (
        <Icon
            name={`chevron circle ${item.isExpanded ? 'down' : 'up'}`}
            onClick={() => toggleExpansion(item)}
            {...(item.data.canBearChildren ? {} : { className: 'hidden' })}
        />
    );

    const onClickItem = item => (item.data.canBearChildren
        ? () => toggleExpansion(item)
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
                    <div className='side-by-side middle left narrow'>
                        {!editing ? (
                            <>
                                <Icon
                                    name='bars'
                                    size='small'
                                    color='grey'
                                    className={`drag-handle ${isDragging ? 'dragging' : ''}`}
                                    {...provided.dragHandleProps}
                                    {...(item.isExpanded
                                        ? { onMouseDown: (...args) => { setTree({ collapse: item.id }); provided.dragHandleProps.onMouseDown(...args); } }
                                        : {}
                                    )}
                                />
                                <div className='side-by-side middle'>
                                    <div>
                                        <span>{getIcon(item)}</span>
                                        <span>{item.data.title}</span>
                                    </div>
                                    {item.data.canBearChildren && (
                                        <div>
                                            <EllipsisMenu
                                                onClick={() => {}}
                                                handleEdit={() => alert('ha')}
                                                handleDelete={() => setDeletionModalVisible(item.id)}
                                                deletable
                                            />
                                            <Icon
                                                id={`${item.data.isFocused ? 'selected' : 'not-selected'}`}
                                                name='eye'
                                                onClick={(e) => { e.stopPropagation(); setTree({ toggleFocus: item.id }); }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Input
                                onChange={() => {}}
                                value={item.data.title}
                                onKeyDown={() => {}}
                                autoFocus
                                onBlur={() => setEditing(false)}
                                fluid
                                data-cy='edit-name'
                            />
                        )}
                    </div>
                </Menu.Item>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex' }}>
            <Confirm
                open={!!deletionModalVisible}
                className='warning'
                header='Warning!'
                confirmButton='Delete'
                content={`The story group ${
                    deletionModalVisible && tree.items[deletionModalVisible].data.title
                } and all its stories in it will be deleted. This action cannot be undone.`}
                onCancel={() => setDeletionModalVisible(false)}
                onConfirm={() => { setTree({ remove: deletionModalVisible }); setDeletionModalVisible(false); }}
            />
            <Menu pointing secondary vertical className={somethingIsDragging ? 'dragging' : ''}>
                <Tree
                    tree={tree}
                    renderItem={renderItem}
                    onExpand={expand => setTree({ expand })}
                    onCollapse={collapse => setTree({ collapse })}
                    onDragEnd={(...move) => { setSomethingIsDragging(false); setTree({ move }); }}
                    onDragStart={() => setSomethingIsDragging(true)}
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
