import {
    useReducer, useState, useEffect, useContext,
} from 'react';
import uuidv4 from 'uuid/v4';
import { mutateTree, moveItemOnTree } from '@atlaskit/tree';
import { ConversationOptionsContext } from '../Context';

const getSourceNode = (tree, source) => tree.items[tree.items[source.parentId].children[source.index]];

const getDestinationNode = (tree, destination) => tree.items[destination.parentId];

const convertId = ({ id, ...rest }) => ({ _id: id, ...rest });

const treeReducer = (externalMutators = {}) => (tree, instruction) => {
    const {
        expand,
        collapse,
        move,
        remove,
        rename,
        toggleFocus,
        newStory,
        activeStories,
        replace,
    } = instruction;
    const {
        updateGroup = () => {},
        deleteGroup = () => {},
        updateStory = () => {},
        addStory = () => {},
        deleteStory = () => {},
    } = externalMutators;

    if (replace) return replace;
    if (expand) {
        const { id } = tree.items[expand];
        updateGroup(convertId({ id, isExpanded: true }));
        return mutateTree(tree, expand, { isExpanded: true });
    }
    if (collapse) {
        const { id } = tree.items[collapse];
        updateGroup(convertId({ id, isExpanded: false }));
        return mutateTree(tree, collapse, { isExpanded: false });
    }
    if (remove) {
        const {
            [remove]: {
                parentId, projectId, children = [], canBearChildren,
            },
            ...items
        } = tree.items;
        children.forEach((key) => {
            delete items[key];
        });
        items[parentId].children = items[parentId].children.filter(
            key => key !== remove,
        );
        (canBearChildren ? deleteGroup : deleteStory)(
            convertId({ id: remove, parentId, projectId }),
        );
        return { ...tree, items };
    }
    if (rename) {
        const { items } = tree;
        const [id, title] = rename;
        items[id].title = title;
        (items[id].canBearChildren ? updateGroup : updateStory)(convertId({ id, title }));
        return { ...tree, items };
    }
    if (newStory) {
        const { items } = tree;
        const [parentId, title] = newStory;
        const id = uuidv4();
        items[parentId].children = [id, ...items[parentId].children];
        items[id] = {
            id,
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            canBearChildren: false,
            title,
            parentId,
        };
        addStory(parentId, title);
        return mutateTree({ ...tree, items }, parentId, { isExpanded: true }); // make sure destination is open
    }
    if (toggleFocus) {
        const { id, selected } = tree.items[toggleFocus];
        updateGroup(convertId({ id, selected: !selected }));
        return mutateTree(tree, toggleFocus, { selected: !selected });
    }
    if (move) {
        const [source, requestedDestination] = move;
        let destination = requestedDestination;
        if (!destination) return tree; // no destination found

        const sourceNode = getSourceNode(tree, source);

        const sourceNodes = sourceNode.canBearChildren || !(activeStories && activeStories.length)
            ? [getSourceNode(tree, source)]
            : activeStories; // move all activeNodes if source is a leaf

        // safety check; does selection span across
        let destinationNode = getDestinationNode(tree, destination);

        const acceptanceCriterion = sourceNodes[0].canBearChildren
            ? candidateNode => candidateNode.id === tree.rootId // only move bearers to root
            : candidateNode => candidateNode.canBearChildren; // move leaves to first bearer
        const identityCheck = candidateNode => c => c === candidateNode.id;
        while (!acceptanceCriterion(destinationNode)) {
            const parentParentId = destinationNode.parentId;
            const parentParentNode = tree.items[parentParentId];
            const index = parentParentNode.children.findIndex(
                identityCheck(destinationNode),
            );
            destination = { index, parentId: parentParentId };
            destinationNode = getDestinationNode(tree, destination);
        }

        if (destinationNode.id === tree.rootId && !sourceNodes[0].canBearChildren) {
            // leaf moved to root
            if (!destination.index || destination.index < 1) return tree;
            const { id: parentId } = tree.items[
                tree.items[tree.rootId].children[destination.index - 1]
            ];
            destination = { parentId };
        }

        // was node dragged from 0th selected item or from somewhere else?
        const indexOfFirstActiveNode = tree.items[source.parentId].children.findIndex(
            id => id === sourceNodes[0].id,
        );
        const offset = source.index - indexOfFirstActiveNode; // assumes first active node is lowest indexed

        if ( // dropped within selection
            destination.parentId === sourceNode.parentId
            && destination.index
            && destination.index >= indexOfFirstActiveNode
            && destination.index <= indexOfFirstActiveNode + sourceNodes.length - 1
        ) return tree;

        let movedTree = tree;
        sourceNodes.forEach((n, i) => {
            const polarizedOffset = i <= source.index + 1 ? -offset : 0;
            const adjustedSource = {
                ...source,
                ...(source.index ? { index: source.index + polarizedOffset } : {}),
            };
            const adjustedDestination = {
                ...destination,
                ...(destination.index ? { index: destination.index + i } : {}),
            };
            movedTree = mutateTree(
                moveItemOnTree(movedTree, adjustedSource, adjustedDestination),
                n.id,
                { parentId: destination.parentId },
            );
        });

        const newDestination = movedTree.items[destination.parentId];
        const newSource = movedTree.items[sourceNode.parentId];
        const updateDestination = () => updateGroup(
            convertId({
                id: newDestination.id,
                children: newDestination.children,
                hasChildren: newDestination.hasChildren,
                isExpanded: true,
            }),
        );
        if (newDestination.id !== newSource.id) { // mother changed
            updateGroup(
                convertId({
                    id: newSource.id,
                    children: newSource.children,
                    hasChildren: newSource.hasChildren,
                }),
                () => updateStory(
                    sourceNodes.map(({ id }) => convertId({ id, parentId: newDestination.id })),
                    updateDestination,
                ),
            );
        } else updateDestination();
        return mutateTree(movedTree, newDestination.id, { isExpanded: true }); // make sure destination is open
    }
    return tree;
};

export const useStoryGroupTree = (treeFromProps, activeStories) => {
    const [somethingIsDragging, setSomethingIsDragging] = useState(false);
    const externalMutators = useContext(ConversationOptionsContext);

    const [tree, setTree] = useReducer(treeReducer(externalMutators), treeFromProps);

    useEffect(() => setTree({ replace: treeFromProps }), [treeFromProps]);
    const toggleExpansion = item => setTree({ [item.isExpanded ? 'collapse' : 'expand']: item.id });

    return {
        tree,
        somethingIsDragging,
        handleToggleFocus: toggleFocus => setTree({ toggleFocus }),
        handleToggleExpansion: toggleExpansion,
        handleExpand: expand => setTree({ expand }),
        handleCollapse: collapse => setTree({ collapse }),
        handleDragEnd: (...move) => {
            setSomethingIsDragging(false);
            setTree({ move, activeStories });
        },
        handleDragStart: () => setSomethingIsDragging(true),
        handleRemoveItem: remove => setTree({ remove }),
        handleRenameItem: (...rename) => setTree({ rename }),
        handleAddStory: (...newStory) => setTree({ newStory }),
    };
};
