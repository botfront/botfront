import {
    useReducer, useState, useEffect, useContext,
} from 'react';
import { useMemoOne } from 'use-memo-one';
import uuidv4 from 'uuid/v4';
import { mutateTree, moveItemOnTree } from '@atlaskit/tree';
import { ConversationOptionsContext } from '../Context';
import { ProjectContext } from '../../../layouts/context';

const isSmartNode = id => !!id.match(/^.*_SMART_/);

const getSourceNode = (tree, source) => tree.items[tree.items[source.parentId].children[source.index]];

const getDestinationNode = (tree, destination) => tree.items[destination.parentId];

const convertId = ({
    id, parentId, title, ...rest
}, type) => {
    let parentField = {};
    let titleField = {};
    if (parentId) {
        if (type === 'story') parentField = { storyGroupId: parentId };
        else parentField = { parentId };
    }
    if (title) {
        if (type === 'story-group') titleField = { name: title };
        if (type === 'form') titleField = { name: title };
        else titleField = { title };
    }
    return {
        _id: id,
        ...parentField,
        ...titleField,
        ...rest,
    };
};

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
        togglePublish,
    } = instruction;
    const { setSomethingIsMutating } = externalMutators;
    const fallbackFunction = (...args) => {
        const callback = args[args.length - 1];
        if (typeof callback === 'function') callback();
    };
    const {
        updateGroup = fallbackFunction,
        setExpansionOnGroup = fallbackFunction,
        deleteGroup = fallbackFunction,
        updateStory = fallbackFunction,
        addStory = fallbackFunction,
        deleteStory = fallbackFunction,
        upsertForm = fallbackFunction,
        deleteForm = fallbackFunction,
        reorderForm = fallbackFunction,
    } = externalMutators;

    const mutatorMapping = (type, action) => {
        if (type === 'story-group') {
            if (action === 'update') return updateGroup;
            if (action === 'expand') return setExpansionOnGroup;
            if (action === 'reorder') return updateGroup;
            if (action === 'delete') return deleteGroup;
        }
        if (type === 'story') {
            if (action === 'update') return updateStory;
            if (action === 'delete') return deleteStory;
        }
        if (type === 'form') {
            if (action === 'update') return upsertForm;
            if (action === 'expand') return upsertForm;
            if (action === 'reorder') return reorderForm;
            if (action === 'delete') return deleteForm;
        }
        return fallbackFunction; // not supported
    };

    if (replace) return replace;
    if (expand) {
        const { id, type } = tree.items[expand];
        setSomethingIsMutating(true);
        mutatorMapping(type, 'expand')(convertId({ id, isExpanded: true }, type), () => setSomethingIsMutating(false));
        return mutateTree(tree, expand, { isExpanded: true });
    }
    if (collapse) {
        const { id, type } = tree.items[collapse];
        setSomethingIsMutating(true);
        mutatorMapping(type, 'expand')(convertId({ id, isExpanded: false }, type), () => setSomethingIsMutating(false));
        return mutateTree(tree, collapse, { isExpanded: false });
    }
    if (remove) {
        const {
            [remove]: {
                parentId, projectId, children = [], type, smartGroup,
            },
            ...items
        } = tree.items;
        if (smartGroup || isSmartNode(remove)) return tree;
        children.forEach((key) => {
            delete items[key];
        });
        items[parentId].children = items[parentId].children.filter(
            key => key !== remove,
        );
        setSomethingIsMutating(true);
        mutatorMapping(type, 'delete')(
            convertId({ id: remove, parentId, projectId }, type),
            () => setSomethingIsMutating(false),
        );
        return { ...tree, items };
    }
    if (rename) {
        const { items } = tree;
        const [id, title] = rename;
        if (items[id].smartGroup || isSmartNode(id)) return tree;
        items[id].title = title;
        setSomethingIsMutating(true);
        mutatorMapping(items[id].type, 'update')(
            convertId({ id, title }, items[id].type),
            () => setSomethingIsMutating(false),
        );
        return { ...tree, items };
    }
    if (newStory) {
        const { items } = tree;
        const [parentId, title, status] = newStory;
        const id = uuidv4();
        if (items[parentId].smartGroup) return tree;
        items[parentId].children = [id, ...items[parentId].children];
        items[id] = {
            id,
            title,
            parentId,
        };
        setSomethingIsMutating(true);
        addStory(convertId({
            id, parentId, title, status,
        }, 'story'), () => setSomethingIsMutating(false));
        return mutateTree({ ...tree, items }, parentId, { isExpanded: true }); // make sure destination is open
    }
    if (toggleFocus) {
        const { id, selected, smartGroup } = tree.items[toggleFocus];
        if (smartGroup) return tree;
        setSomethingIsMutating(true);
        updateGroup(convertId({ id, selected: !selected }, 'story-group'), () => setSomethingIsMutating(false));
        return mutateTree(tree, toggleFocus, { selected: !selected });
    }
    if (togglePublish) {
        const { id, status } = tree.items[togglePublish];
        const newStatus = status === 'published' ? 'unpublished' : 'published';
        setSomethingIsMutating(true);
        updateStory(convertId({ id, status: newStatus }), () => setSomethingIsMutating(false));
        return mutateTree(tree, togglePublish, { status: newStatus });
    }
    if (move) {
        const [source, requestedDestination] = move;
        let destination = requestedDestination;
        if (!destination || !destination.parentId) return tree; // no destination found

        const sourceNode = getSourceNode(tree, source);

        if (isSmartNode(sourceNode.id)) return tree; // don't move out of a smartGroup

        const sourceNodes = ['story-group', 'form'].includes(sourceNode.type)
            || !activeStories
            || !activeStories.includes(sourceNode.id)
            ? [sourceNode]
            : activeStories // move all activeNodes if source is a leaf
                .filter(id => !isSmartNode(id)) // no smart group child
                .map(id => tree.items[id]);

        let destinationNode = getDestinationNode(tree, destination);
        const acceptanceCriterion = ['story-group', 'form'].includes(sourceNodes[0].type)
            ? candidateNode => candidateNode.id === tree.rootId // only move forms and groups to root
            : sourceNodes[0].type === 'story'
                ? candidateNode => candidateNode.type === 'story-group' // move stories to first group
                : candidateNode => candidateNode.id === sourceNodes[0].parentId; // move slots only to their parent
        const identityCheck = candidateNode => c => c === candidateNode.id;
        while (!acceptanceCriterion(destinationNode)) {
            const parentParentId = destinationNode.parentId;
            const parentParentNode = tree.items[parentParentId];
            if (!parentParentNode) break;
            const index = parentParentNode.children.findIndex(
                identityCheck(destinationNode),
            );
            destination = { index, parentId: parentParentId };
            destinationNode = getDestinationNode(tree, destination);
        }
        
        /* keep moving pinned nodes back until they reach a pinned node, and
            keep moving non-pinned nodes forward until they reach a non-pinned node */
        const acceptanceCriterionTwo = sourceNodes[0].pinned
            ? index => (tree.items[destinationNode.children[index]] || {}).pinned
            : index => !(tree.items[destinationNode.children[index]] || {}).pinned;
        const operationTwo = sourceNodes[0].pinned
            ? index => index - 1
            : index => index + 1;
        while (
            Number.isInteger(destination.index)
            && !acceptanceCriterionTwo(destination.index)
        ) {
            destination.index = operationTwo(destination.index);
        }

        while (!acceptanceCriterion(destinationNode)) {
            // leaf moved to root
            if (!destination.index || destination.index < 1) return tree;
            const { id: parentId } = tree.items[
                tree.items[tree.rootId].children[destination.index - 1]
            ];
            destination = { parentId };
            destinationNode = getDestinationNode(tree, destination);
        }

        if (destinationNode.smartGroup) return tree; // don't move into a smartGroup

        // was node dragged from 0th selected item or from somewhere else?
        const indexOfFirstActiveNode = tree.items[source.parentId].children.findIndex(
            id => id === sourceNodes[0].id,
        );
        const offset = source.index - indexOfFirstActiveNode; // assumes first active node is lowest indexed

        const sameMother = destination.parentId === sourceNode.parentId
            && Number.isInteger(destination.index);
        if (
            sameMother // dropped within selection
            && destination.index >= indexOfFirstActiveNode
            && destination.index <= indexOfFirstActiveNode + sourceNodes.length - 1
        ) {
            return tree;
        }

        const aboveUnderSameMother = sameMother && destination.index < indexOfFirstActiveNode;
        const underUnderSameMother = !aboveUnderSameMother && sameMother;

        let movedTree = tree;
        sourceNodes.forEach((n, i) => {
            const polarizedOffset = aboveUnderSameMother
                ? -offset + i
                : i <= source.index + 1
                    ? -offset
                    : 0;
            const destinationOffset = underUnderSameMother ? 0 : i;
            const adjustedSource = {
                ...source,
                ...(Number.isInteger(source.index)
                    ? { index: source.index + polarizedOffset }
                    : {}),
            };
            const adjustedDestination = {
                ...destination,
                ...(Number.isInteger(destination.index)
                    ? { index: destination.index + destinationOffset }
                    : {}),
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
        const updateDestination = () => mutatorMapping(newDestination.type, 'reorder')(
            convertId({
                id: newDestination.id,
                children: newDestination.children,
                isExpanded: true,
            }),
            () => setSomethingIsMutating(false),
        );
        if (newDestination.id !== newSource.id) {
            // mother changed
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
    const {
        project: { _id: projectId },
    } = useContext(ProjectContext);

    const externalMutators = {
        ...useContext(ConversationOptionsContext),
        setSomethingIsMutating,
    };
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
        handleTogglePublish: togglePublish => setTree({ togglePublish }),
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
