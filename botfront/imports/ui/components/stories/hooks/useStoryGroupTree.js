import {
    useReducer, useState, useEffect, useContext,
} from 'react';
import { useMemoOne } from 'use-memo-one';
import uuidv4 from 'uuid/v4';
import { mutateTree, moveItemOnTree } from '@atlaskit/tree';
import { ConversationOptionsContext } from '../Context';
import { ProjectContext } from '../../../layouts/context';

const getSourceNode = (tree, source) => tree.items[tree.items[source.parentId].children[source.index]];

const getDestinationNode = (tree, destination) => tree.items[destination.parentId];

const convertId = ({
    id, parentId, title, ...rest
}, canBearChildren) => ({
    _id: id,
    ...(parentId ? (canBearChildren ? { parentId } : { storyGroupId: parentId }) : {}),
    ...(title ? (canBearChildren ? { name: title } : { title }) : {}),
    ...rest,
});

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
    const { setSomethingIsMutating } = externalMutators;
    const fallbackFunction = (...args) => {
        const callback = args[args.length - 1];
        if (typeof callback === 'function') callback();
    };
    const {
        updateGroup = fallbackFunction,
        deleteGroup = fallbackFunction,
        updateStory = fallbackFunction,
        addStory = fallbackFunction,
        deleteStory = fallbackFunction,
    } = externalMutators;

    if (replace) return replace;
    if (expand) {
        const { id } = tree.items[expand];
        setSomethingIsMutating(true);
        updateGroup(convertId({ id, isExpanded: true }), () => setSomethingIsMutating(false));
        return mutateTree(tree, expand, { isExpanded: true });
    }
    if (collapse) {
        const { id } = tree.items[collapse];
        setSomethingIsMutating(true);
        updateGroup(convertId({ id, isExpanded: false }), () => setSomethingIsMutating(false));
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
        setSomethingIsMutating(true);
        (canBearChildren ? deleteGroup : deleteStory)(
            convertId({ id: remove, parentId, projectId }, canBearChildren),
            () => setSomethingIsMutating(false),
        );
        return { ...tree, items };
    }
    if (rename) {
        const { items } = tree;
        const [id, title] = rename;
        items[id].title = title;
        setSomethingIsMutating(true);
        (items[id].canBearChildren ? updateGroup : updateStory)(
            convertId({ id, title }, items[id].canBearChildren),
            () => setSomethingIsMutating(false),
        );
        return { ...tree, items };
    }
    if (newStory) {
        const { items } = tree;
        const [parentId, title] = newStory;
        const id = uuidv4();
        items[parentId].children = [id, ...items[parentId].children];
        items[id] = {
            id, title, parentId,
        };
        setSomethingIsMutating(true);
        addStory(convertId({ id, parentId, title }, false), () => setSomethingIsMutating(false));
        return mutateTree({ ...tree, items }, parentId, { isExpanded: true }); // make sure destination is open
    }
    if (toggleFocus) {
        const { id, selected } = tree.items[toggleFocus];
        setSomethingIsMutating(true);
        updateGroup(convertId({ id, selected: !selected }), () => setSomethingIsMutating(false));
        return mutateTree(tree, toggleFocus, { selected: !selected });
    }
    if (move) {
        const [source, requestedDestination] = move;
        let destination = requestedDestination;
        if (!destination || !destination.parentId) return tree; // no destination found

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

        const sameMother = destination.parentId === sourceNode.parentId && Number.isInteger(destination.index);
        if (sameMother // dropped within selection
            && destination.index >= indexOfFirstActiveNode
            && destination.index <= indexOfFirstActiveNode + sourceNodes.length - 1
        ) return tree;

        const aboveUnderSameMother = sameMother && destination.index < indexOfFirstActiveNode;

        let movedTree = tree;
        sourceNodes.forEach((n, i) => {
            let polarizedOffset = i <= source.index + 1 ? -offset : offset - i;
            if (aboveUnderSameMother) polarizedOffset += i;
            const adjustedSource = {
                ...source,
                ...(Number.isInteger(source.index) ? { index: source.index + polarizedOffset } : {}),
            };
            const adjustedDestination = {
                ...destination,
                ...(Number.isInteger(destination.index) ? { index: destination.index + i } : {}),
            };
            movedTree = mutateTree(
                moveItemOnTree(movedTree, adjustedSource, adjustedDestination),
                n.id,
                { parentId: destination.parentId },
            );
        });

        const newDestination = movedTree.items[destination.parentId];
        const newSource = movedTree.items[sourceNode.parentId];
        setSomethingIsMutating(true);
        const updateDestination = () => updateGroup(
            convertId({
                id: newDestination.id,
                children: newDestination.children,
                isExpanded: true,
            }),
            () => setSomethingIsMutating(false),
        );
        if (newDestination.id !== newSource.id) { // mother changed
            updateGroup(
                convertId({
                    id: newSource.id,
                    children: newSource.children,
                }),
                () => updateStory(
                    sourceNodes.map(({ id }) => convertId({ id, parentId: newDestination.id }, false)),
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
    const [somethingIsMutating, setSomethingIsMutating] = useState(false);
    const { project: { _id: projectId } } = useContext(ProjectContext);

    const externalMutators = { ...useContext(ConversationOptionsContext), setSomethingIsMutating };
    const reducer = useMemoOne(() => treeReducer(externalMutators), [projectId]);

    const [tree, setTree] = useReducer(reducer, treeFromProps);

    useEffect(() => setTree({ replace: treeFromProps }), [treeFromProps]);
    const toggleExpansion = item => setTree({ [item.isExpanded ? 'collapse' : 'expand']: item.id });

    return {
        tree,
        somethingIsDragging,
        somethingIsMutating,
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
