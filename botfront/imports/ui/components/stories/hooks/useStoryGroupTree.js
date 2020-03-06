import { useReducer, useState, useEffect } from 'react';
import uuidv4 from 'uuid/v4';
import {
    getItem, getParent, mutateTree, moveItemOnTree,
} from '@atlaskit/tree';

const getSourceNode = (tree, source) => tree.items[tree.items[source.parentId].children[source.index]];

const getDestinationNode = (tree, destination) => tree.items[destination.parentId];

const treeReducer = (tree, instruction) => {
    const {
        expand, collapse, move, remove, rename, toggleFocus, addGroup, addStory, activeStories, replace,
    } = instruction;

    if (replace) return replace;
    if (expand) return mutateTree(tree, expand, { isExpanded: true });
    if (collapse) return mutateTree(tree, collapse, { isExpanded: false });
    if (remove) {
        const { [remove]: { parentId, children }, ...items } = tree.items;
        children.forEach((key) => { delete items[key]; });
        items[parentId].children = items[parentId].children
            .filter(key => key !== remove);
        return { ...tree, items };
    }
    if (rename) {
        const { items } = tree;
        const [id, newName] = rename;
        items[id].title = newName;
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
            canBearChildren: true,
            title: addGroup,
            parentId: tree.rootId,
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
            canBearChildren: false,
            title: storyName,
            parentId,
        };
        return mutateTree({ ...tree, items }, parentId, { isExpanded: true }); // make sure destination is open
    }
    if (toggleFocus) {
        const { selected } = tree.items[toggleFocus];
        return mutateTree(tree, toggleFocus, { selected: !selected });
    }
    if (move) {
        const [source, requestedDestination] = move;
        let destination = requestedDestination;
        if (!destination) return tree; // no destination found

        const sourceNode = getSourceNode(tree, source);
        
        const sourceNodes = (
            sourceNode.canBearChildren
            || !(activeStories && activeStories.length)
        ) // move all activeNodes if source is a leaf
            ? [getSourceNode(tree, source)] : activeStories;

        // safety check; does selection span across
        let destinationNode = getDestinationNode(tree, destination);

        const acceptanceCriterion = sourceNodes[0].canBearChildren
            ? candidateNode => candidateNode.id === tree.rootId // only move bearers to root
            : candidateNode => candidateNode.canBearChildren; // move leaves to first bearer
        const identityCheck = candidateNode => c => c === candidateNode.id;
        while (!acceptanceCriterion(destinationNode)) {
            const parentParentId = destinationNode.parentId;
            const parentParentNode = tree.items[parentParentId];
            const index = parentParentNode.children.findIndex(identityCheck(destinationNode));
            destination = { index, parentId: parentParentId };
            destinationNode = getDestinationNode(tree, destination);
        }

        if (destinationNode.id === tree.rootId && !sourceNodes[0].canBearChildren) {
            // leaf moved to root
            if (!destination.index || destination.index < 1) return tree;
            const { id: parentId } = tree.items[tree.items[tree.rootId].children[destination.index - 1]];
            destination = { parentId };
        }

        // was node dragged from 0th selected item or from somewhere else?
        const indexOfFirstActiveNode = tree.items[source.parentId].children.findIndex(id => id === sourceNodes[0].id);
        const offset = source.index - indexOfFirstActiveNode; // assumes first active node is lowest indexed

        let movedTree = tree;
        sourceNodes.forEach((n, i) => {
            const polarizedOffset = i <= source.index + 1 ? -offset : 0;
            const adjustedSource = { ...source, ...(source.index ? { index: source.index + polarizedOffset } : {}) };
            const adjustedDestination = { ...destination, ...(destination.index ? { index: destination.index + i } : {}) };
            movedTree = mutateTree(
                moveItemOnTree(movedTree, adjustedSource, adjustedDestination),
                n.id,
                { parentId: destination.parentId },
            );
        });

        return mutateTree(movedTree, destination.parentId, { isExpanded: true }); // make sure destination is open
    }
    return tree;
};

export const useStoryGroupTree = (treeFromProps, activeStories) => {
    const [somethingIsDragging, setSomethingIsDragging] = useState(false);
    
    const [tree, setTree] = useReducer(treeReducer, treeFromProps);

    useEffect(() => setTree({ replace: treeFromProps }), [treeFromProps]);
    const toggleExpansion = item => setTree({ [item.isExpanded ? 'collapse' : 'expand']: item.id });

    return {
        tree,
        somethingIsDragging,
        onToggleFocus: toggleFocus => setTree({ toggleFocus }),
        onToggleExpansion: toggleExpansion,
        onExpand: expand => setTree({ expand }),
        onCollapse: collapse => setTree({ collapse }),
        onDragEnd: (...move) => { setSomethingIsDragging(false); setTree({ move, activeStories }); },
        onDragStart: () => setSomethingIsDragging(true),
        onRemoveItem: remove => setTree({ remove }),
        onRenameItem: (...rename) => setTree({ rename }),
        onAddGroup: addGroup => setTree({ addGroup }),
        onAddStory: (...addStory) => setTree({ addStory }),
    };
};
