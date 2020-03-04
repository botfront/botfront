import { useReducer, useState } from 'react';
import uuidv4 from 'uuid/v4';
import {
    getItem, getParent, mutateTree, moveItemOnTree,
} from '@atlaskit/tree';

const getSourceAndDestinationNodes = (tree, source, destination) => [
    tree.items[tree.items[source.parentId].children[source.index]],
    tree.items[destination.parentId],
];

const treeReducer = (tree, instruction) => {
    const {
        expand, collapse, move, remove, rename, toggleFocus, addGroup, addStory,
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
    if (rename) {
        const { items } = tree;
        const [id, newName] = rename;
        items[id].data.title = newName;
        return { ...tree, items };
    }
    if (addGroup) {
        const { items } = tree;
        const id = uuidv4();
        items[tree.rootId].children = [id, ...items[tree.rootId].children];
        items[id] = {
            id,
            children: [],
            hasChildren: false,
            isExpanded: true,
            isChildrenLoading: false,
            data: {
                canBearChildren: true,
                title: addGroup,
                parentId: tree.rootId,
            },
        };
        return { ...tree, items };
    }
    if (addStory) {
        const { items } = tree;
        const [parentId, storyName] = addStory;
        const id = uuidv4();
        items[parentId].children = [id, ...items[parentId].children];
        items[id] = {
            id,
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                canBearChildren: false,
                title: storyName,
                parentId,
            },
        };
        return mutateTree({ ...tree, items }, parentId, { isExpanded: true }); // make sure destination is open
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

export const useStoryGroupTree = (treeFromProps) => {
    const [somethingIsDragging, setSomethingIsDragging] = useState(false);
    
    const [tree, setTree] = useReducer(treeReducer, treeFromProps);
    const toggleExpansion = item => setTree({ [item.isExpanded ? 'collapse' : 'expand']: item.id });

    return {
        tree,
        somethingIsDragging,
        onToggleFocus: toggleFocus => setTree({ toggleFocus }),
        onToggleExpansion: toggleExpansion,
        onExpand: expand => setTree({ expand }),
        onCollapse: collapse => setTree({ collapse }),
        onDragEnd: (...move) => { setSomethingIsDragging(false); setTree({ move }); },
        onDragStart: () => setSomethingIsDragging(true),
        onRemoveItem: remove => setTree({ remove }),
        onRenameItem: (...rename) => setTree({ rename }),
        onAddGroup: addGroup => setTree({ addGroup }),
        onAddStory: (...addStory) => setTree({ addStory }),
    };
};
