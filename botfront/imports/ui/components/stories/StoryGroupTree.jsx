import React, { useReducer } from 'react';
import PropTypes from 'prop-types';
import Navigation, { AkNavigationItem } from '@atlaskit/navigation';
import { Icon } from 'semantic-ui-react';
import Tree, { mutateTree, moveItemOnTree } from '@atlaskit/tree';

export default function StoryGroupTree(props) {
    const { tree: treeFromProps, onChangeActiveStory, activeStory } = props;

    const treeReducer = (tree, instruction) => {
        const { expand, collapse, move } = instruction;
        if (expand) return mutateTree(tree, expand, { isExpanded: true });
        if (collapse) return mutateTree(tree, collapse, { isExpanded: false });
        if (move) {
            const [source, requestedDestination] = move;
            let destination = requestedDestination;
            if (!destination) return tree; // no destination found
            const destinationNode = tree.items[destination.parentId];
            if (!destinationNode.data.canBearChildren) { // node can't bear
                const parentParentId = destination.parentId.split('-').slice(0, -1).join('-');
                const parentParentNode = tree.items[parentParentId];
                const indexInParentParentNode = parentParentNode.children.findIndex(c => c === destination.parentId);
                const index = Math.max(0, indexInParentParentNode - 1);
                destination = { ...destination, index, parentId: parentParentId };
            }
            const movedTree = moveItemOnTree(tree, source, destination);
            return !destinationNode.isExpanded // open destination is closed
                ? mutateTree(movedTree, destinationNode.id, { isExpanded: true })
                : movedTree;
        }
        return tree;
    };
    const [tree, setTree] = useReducer(treeReducer, treeFromProps);

    const toggleExpansion = item => setTree({ [item.isExpanded ? 'collapse' : 'expand']: item.id });

    const getIcon = item => (item.data.canBearChildren
        ? (
            <Icon
                name={`chevron circle ${item.isExpanded ? 'down' : 'up'}`}
                onClick={() => toggleExpansion(item)}
            />
        )
        : <Icon name={`circle ${item.id === activeStory.id ? '' : 'outline'}`} />);

    const renderItem = (renderProps) => {
        const { item, provided, snapshot } = renderProps;
        const onClick = item.data.canBearChildren
            ? () => toggleExpansion(item)
            : () => onChangeActiveStory(item);
        return (
            <div ref={provided.innerRef} {...provided.draggableProps}>
                <AkNavigationItem
                    isSelected={item.id === activeStory.id}
                    isDragging={snapshot.isDragging}
                    onClick={onClick}
                    text={item.data ? item.data.title : ''}
                    icon={getIcon(item)}
                    dnd={{ dragHandleProps: provided.dragHandleProps }}
                />
            </div>
        );
    };

    return (
        <div style={{ display: 'flex' }}>
            <Navigation>
                <Tree
                    tree={tree}
                    renderItem={renderItem}
                    onExpand={expand => setTree({ expand })}
                    onCollapse={collapse => setTree({ collapse })}
                    onDragEnd={(...move) => setTree({ move })}
                    isDragEnabled
                    isNestingEnabled
                />
            </Navigation>
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
