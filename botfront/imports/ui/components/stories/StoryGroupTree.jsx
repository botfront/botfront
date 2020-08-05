import React, {
    useState,
    useRef,
    useCallback,
    useMemo,
    useContext,
    useEffect,
    useImperativeHandle,
} from 'react';
import PropTypes from 'prop-types';
import { Menu, Confirm, Portal } from 'semantic-ui-react';
import EmbeddedTree from '../common/EmbeddedTree';
import { useStoryGroupTree } from './hooks/useStoryGroupTree';
import StoryGroupTreeNode from './StoryGroupTreeNode';
import { useEventListener } from '../utils/hooks';
import { ProjectContext } from '../../layouts/context';
import { can } from '../../../lib/scopes';

const openFirstStoryIfNoneSelected = (
    storyMenuSelection,
    tree,
    handleExpand,
    selectSingleItemAndResetFocus,
    onChangeStoryMenuSelection,
) => () => {
    const idsActuallyInTree = storyMenuSelection.filter(id => id in tree.items);
    if (idsActuallyInTree.length) {
        if (idsActuallyInTree.length !== storyMenuSelection.length) { onChangeStoryMenuSelection(idsActuallyInTree); }
        return;
    }
    let storiesFound = [];
    let groupId; let typeOfNode;
    let i = 0;
    while (typeOfNode !== 'story-group' || !storiesFound.length) {
        groupId = tree.items[tree.rootId].children[i];
        typeOfNode = tree.items[groupId].type;
        storiesFound = tree.items[groupId].children;
        i += 1;
        if (i > tree.items[tree.rootId].children.length - 1) break;
    }
    if (storiesFound.length) {
        if (tree.items && tree.items[groupId] && tree.items[groupId].isExpanded === false) handleExpand(groupId);
        selectSingleItemAndResetFocus(tree.items[storiesFound[0]]);
    }
};

const StoryGroupTree = React.forwardRef((props, ref) => {
    const {
        onChangeStoryMenuSelection,
        storyMenuSelection,
        forms,
        storyGroups,
        stories,
        isDeletionPossible,
    } = props;

    const [deletionModalVisible, setDeletionModalVisible] = useState(false);
    const [mouseDown, setMouseDown] = useState(false);

    const {
        project: { _id: projectId, storyGroups: storyGroupOrder = [], deploymentEnvironments },
    } = useContext(ProjectContext);

    const disableEdit = useMemo(() => !can('stories:w', projectId), [projectId]);
    const showPublish = useMemo(() => deploymentEnvironments && deploymentEnvironments.length > 0, [deploymentEnvironments]);

    const verifyGroupOrder = () => {
        // It may happen that storyGroups and storyGroupOrder are out of sync
        // This is just a workaround as Meteor does not update storyGroupOrder after importing
        const ids = [...storyGroups, ...forms].map(({ _id }) => _id);
        // check that storygroup forms and storygrous are in sync ( have the same value in different orders)
        if (!(
            ids.length === storyGroupOrder.length
            && ids.every(id => storyGroupOrder.includes(id))
        )) {
            Meteor.call('storyGroups.rebuildOrder', projectId);
        }
    };

    useEffect(verifyGroupOrder, []);

    const treeFromProps = useMemo(() => {
        // build tree
        const newTree = {
            rootId: 'root',
            items: {},
        };
        stories.forEach(({ _id, storyGroupId, ...n }) => {
            newTree.items[_id] = {
                ...n,
                id: _id,
                parentId: storyGroupId,
                type: 'story',
            };
        });
        storyGroups.forEach(({ _id, name, ...n }) => {
            newTree.items[_id] = {
                ...n,
                id: _id,
                parentId: 'root',
                title: name,
                type: 'story-group',
            };
        });
        forms.forEach(({ _id, slots, ...form }) => {
            newTree.items[_id] = {
                ...form,
                id: _id,
                parentId: 'root',
                title: form.name,
                children: slots.map(({ name, ...slot }) => {
                    const id = `${name}_slot_for_${_id}`;
                    newTree.items[id] = {
                        id, title: name, ...slot, parentId: _id, type: 'form-slot',
                    };
                    return id;
                }),
                type: 'form',
            };
        });
        newTree.items.root = {
            children: storyGroupOrder.filter(id => id in newTree.items),
            id: 'root',
            title: 'root',
            type: 'root',
        };
        return newTree;
    }, [forms, storyGroups, projectId, stories, storyGroupOrder]);

    const {
        tree,
        somethingIsMutating,
        somethingIsDragging,
        handleToggleFocus,
        handleTogglePublish,
        handleToggleExpansion,
        handleExpand,
        handleCollapse,
        handleDragEnd,
        handleDragStart,
        handleRemoveItem,
        handleRenameItem,
        handleAddStory,
    } = useStoryGroupTree(treeFromProps, storyMenuSelection);
    const menuRef = useRef();
    const lastFocusedItem = useRef(tree.items[storyMenuSelection[0]] || null);
    const draggingHandle = {
        current: document.getElementsByClassName('drag-handle dragging')[0] || null,
    };
    useImperativeHandle(ref, () => ({
        focusMenu: () => menuRef.current.focus(),
    }));
    if (window.Cypress) {
        window.moveItem = handleDragEnd;
        window.getParentAndIndex = (id) => {
            const { parentId } = tree.items[id];
            const index = tree.items[parentId].children.findIndex(cid => cid === id);
            return { parentId, index };
        };
    }
    const selectionIsNonContiguous = useMemo(
        () => !somethingIsMutating
            && (storyMenuSelection || []).some((s, i, a) => {
                if (!(s in tree.items)) return false;
                const differentMother = tree.items[s].parentId
                    !== tree.items[a[Math.min(i + 1, a.length - 1)]].parentId;
                if (differentMother) return true;
                const { children } = tree.items[tree.items[a[0]].parentId] || {};
                if (!children) return false;
                return (
                    Math.abs(
                        children.findIndex(id => id === s)
                            - children.findIndex(
                                id => id === a[Math.min(i + 1, a.length - 1)],
                            ),
                    ) > 1
                );
            }),
        [tree, storyMenuSelection],
    );

    const getSiblingsAndIndex = (story, inputTree) => {
        const { id, parentId } = story;
        const siblingIds = inputTree.items[parentId].children;
        const index = siblingIds.findIndex(c => c === id);
        return { index, siblingIds, parentId };
    };

    const getItemDataFromDOMNode = node => node.id.replace('story-menu-item-', '');

    const selectSingleItemAndResetFocus = (item) => {
        lastFocusedItem.current = item;
        return onChangeStoryMenuSelection([item.id]);
    };

    const handleSelectionChange = ({ shiftKey, item }) => {
        if (!menuRef.current.contains(document.activeElement)) {
            document.activeElement.blur(); // blur so edits are saved
        }
        if (!shiftKey || !storyMenuSelection.length) {
            return selectSingleItemAndResetFocus(item);
        }
        const { index, siblingIds, parentId } = getSiblingsAndIndex(item, tree);
        const { index: lastIndex, parentId: lastParentId } = getSiblingsAndIndex(
            lastFocusedItem.current,
            tree,
        );
        if (parentId !== lastParentId) return selectSingleItemAndResetFocus(item); // no cross-group selects
        const [min, max] = index < lastIndex ? [index, lastIndex] : [lastIndex, index];
        const newSelectionIds = siblingIds.slice(min, max + 1);

        return onChangeStoryMenuSelection(newSelectionIds);
    };

    const getTreeContainer = () => document.getElementById('storygroup-tree');

    const handleMouseDownInMenu = ({ shiftKey, item }) => {
        handleSelectionChange({ shiftKey, item });
        if (shiftKey) return;
        setMouseDown(true);
    };

    const handleMouseEnterInMenu = ({ item }) => {
        if (!mouseDown) return;
        handleSelectionChange({ shiftKey: true, item });
    };

    const handleKeyDownInMenu = useCallback(
        (e) => {
            const { target, key, shiftKey } = e;
            if (!menuRef.current.contains(target)) return null;
            const activeEl = getItemDataFromDOMNode(document.activeElement) === 'storygroup-tree'
                ? document.getElementById(
                    `story-menu-item-${(lastFocusedItem.current || {}).id}`,
                )
                : document.activeElement;
            if (!storyMenuSelection.length) return null;
            const { previousElementSibling, nextElementSibling } = activeEl;

            if (key === 'ArrowUp') {
                if (e.stopPropagation) {
                    e.stopPropagation();
                    e.preventDefault();
                }
                if (target.offsetTop - getTreeContainer().scrollTop < 20) {
                    getTreeContainer().scrollTop -= 100;
                }
                if (previousElementSibling) {
                    previousElementSibling.focus({ preventScroll: true });
                } else return null;
            } else if (key === 'ArrowDown') {
                if (e.stopPropagation) {
                    e.stopPropagation();
                    e.preventDefault();
                }
                if (
                    menuRef.current.clientHeight
                        + getTreeContainer().scrollTop
                        - target.offsetTop
                    < 100
                ) {
                    getTreeContainer().scrollTop += 100;
                }
                if (nextElementSibling) nextElementSibling.focus({ preventScroll: true });
                else return null;
            } else return null;
            const item = tree.items[getItemDataFromDOMNode(document.activeElement)];

            if (item.type === 'story-group') {
                return handleKeyDownInMenu({ target, key, shiftKey });
            } // go to next visible leaf
            return handleSelectionChange({ shiftKey, item });
        },
        [storyMenuSelection, tree],
    );

    useEventListener('keydown', handleKeyDownInMenu);
    useEventListener('mouseup', () => setMouseDown(false));

    useEffect(
        openFirstStoryIfNoneSelected(
            storyMenuSelection,
            tree,
            handleExpand,
            selectSingleItemAndResetFocus,
            onChangeStoryMenuSelection,
        ),
        [projectId],
    );

    const renderItem = renderProps => (
        <StoryGroupTreeNode
            {...renderProps}
            handleTogglePublish={handleTogglePublish}
            somethingIsMutating={somethingIsMutating}
            activeStories={storyMenuSelection}
            handleMouseDownInMenu={handleMouseDownInMenu}
            handleMouseEnterInMenu={handleMouseEnterInMenu}
            setDeletionModalVisible={setDeletionModalVisible}
            handleToggleExpansion={handleToggleExpansion}
            handleCollapse={handleCollapse}
            handleAddStory={handleAddStory}
            handleToggleFocus={handleToggleFocus}
            handleRenameItem={handleRenameItem}
            selectionIsNonContiguous={selectionIsNonContiguous}
            disabled={disableEdit}
            showPublish={showPublish}
        />
    );

    const [deletionIsPossible, deletionModalMessage] = useMemo(
        () => isDeletionPossible(deletionModalVisible, stories, tree),
        [!!deletionModalVisible],
    );

    return (
        <div id='storygroup-tree' ref={menuRef}>
            <Confirm
                open={!!deletionModalVisible}
                className='warning'
                header='Warning!'
                confirmButton='Delete'
                content={deletionModalMessage}
                onCancel={() => setDeletionModalVisible(false)}
                {...(deletionIsPossible
                    ? {
                        onConfirm: () => {
                            handleRemoveItem(deletionModalVisible.id);
                            onChangeStoryMenuSelection(
                                storyMenuSelection.filter(
                                    id => id !== deletionModalVisible.id,
                                ),
                            );
                            setDeletionModalVisible(false);
                        },
                    }
                    : {})}
                {...(deletionIsPossible ? {} : { confirmButton: null })}
            />
            {somethingIsDragging
                && draggingHandle.current.parentNode.parentNode.className.includes(
                    'active',
                )
                && storyMenuSelection.length > 1 && (
                <Portal open mountNode={draggingHandle.current}>
                    <div className='count-tooltip'>{storyMenuSelection.length}</div>
                </Portal>
            )}
            <Menu
                pointing
                secondary
                vertical
                className={somethingIsDragging ? 'dragging' : ''}
            >
                <EmbeddedTree
                    id='storygroup-tree'
                    tree={tree}
                    renderItem={renderItem}
                    onExpand={handleExpand}
                    onCollapse={handleCollapse}
                    onDragEnd={handleDragEnd}
                    onDragStart={handleDragStart}
                    offsetPerLevel={0}
                    isDragEnabled
                    isNestingEnabled
                />
            </Menu>
        </div>
    );
});

StoryGroupTree.propTypes = {
    forms: PropTypes.array.isRequired,
    storyGroups: PropTypes.array.isRequired,
    stories: PropTypes.array.isRequired,
    onChangeStoryMenuSelection: PropTypes.func.isRequired,
    storyMenuSelection: PropTypes.array,
    isDeletionPossible: PropTypes.func,
};

StoryGroupTree.defaultProps = {
    storyMenuSelection: [],
    isDeletionPossible: () => [true, 'Delete?'],
};

export default StoryGroupTree;
