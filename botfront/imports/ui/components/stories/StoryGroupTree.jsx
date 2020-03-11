import React, {
    useState,
    useRef,
    useCallback,
    useMemo,
    useContext,
} from 'react';
import PropTypes from 'prop-types';
import { Menu, Confirm, Portal } from 'semantic-ui-react';
import EmbeddedTree from '../common/EmbeddedTree';
import { useStoryGroupTree } from './hooks/useStoryGroupTree';
import StoryGroupTreeNode from './StoryGroupTreeNode';
import { useEventListener } from '../utils/hooks';
import { ProjectContext } from '../../layouts/context';

export default function StoryGroupTree(props) {
    const {
        onChangeActiveStories,
        activeStories,
        storyGroups,
        stories,
        isStoryDeletable,
    } = props;
    const [deletionModalVisible, setDeletionModalVisible] = useState(false);
    const {
        project: { _id: projectId, storyGroups: storyGroupOrder },
    } = useContext(ProjectContext);

    const treeFromProps = useMemo(() => {
        const newTree = { rootId: projectId, items: {} };
        const root = {
            children: storyGroupOrder,
            _id: projectId,
            title: 'root',
            parentId: 'root',
            projectId,
        };
        [root, ...storyGroups, ...stories].forEach(({ _id, ...n }) => {
            newTree.items = { ...newTree.items, [_id]: { id: _id, ...n } };
        });
        return newTree;
    }, [storyGroups.length, storyGroupOrder.length]);

    const {
        tree,
        somethingIsMutating,
        somethingIsDragging,
        handleToggleFocus,
        handleToggleExpansion,
        handleExpand,
        handleCollapse,
        handleDragEnd,
        handleDragStart,
        handleRemoveItem,
        handleRenameItem,
        handleAddStory,
    } = useStoryGroupTree(treeFromProps, activeStories);
    const menuRef = useRef();
    const lastFocusedItem = useRef();

    const getSiblingsAndIndex = (story, inputTree) => {
        const { id, parentId } = story;
        const siblingIds = inputTree.items[parentId].children;
        const index = siblingIds.findIndex(c => c === id);
        return { index, siblingIds, parentId };
    };

    const getItemDataFromDOMNode = node => node.attributes['item-id'].nodeValue;

    const selectSingleItemAndResetFocus = (item) => {
        lastFocusedItem.current = item;
        return onChangeActiveStories([item]);
    };

    const handleSelectionChange = ({ shiftKey, item }) => {
        if (!shiftKey || !activeStories.length) { return selectSingleItemAndResetFocus(item); }
        const { index, siblingIds, parentId } = getSiblingsAndIndex(item, tree);
        const { index: lastIndex, parentId: lastParentId } = getSiblingsAndIndex(
            lastFocusedItem.current,
            tree,
        );
        if (parentId !== lastParentId) return selectSingleItemAndResetFocus(item); // no cross-group selects
        const [min, max] = index < lastIndex ? [index, lastIndex] : [lastIndex, index];
        const newActiveStoryIds = siblingIds.slice(min, max + 1);

        return onChangeActiveStories(newActiveStoryIds.map(id => tree.items[id]));
    };

    const getTreeContainer = () => document.getElementById('storygroup-tree');

    const handleKeyDownInMenu = useCallback(
        (e) => {
            const { target, key, shiftKey } = e;
            if (!menuRef.current.contains(target)) return null;
            if (!activeStories.length) return null;
            const { previousElementSibling, nextElementSibling } = document.activeElement;

            if (key === 'ArrowUp') {
                if (e.stopPropagation) {
                    e.stopPropagation();
                    e.preventDefault();
                }
                if (target.offsetTop - getTreeContainer().scrollTop < 20) {
                    getTreeContainer().scrollTop -= 100;
                }
                if (previousElementSibling) { previousElementSibling.focus({ preventScroll: true }); } else return null;
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

            if (item.canBearChildren) { return handleKeyDownInMenu({ target, key, shiftKey }); } // go to next visible leaf
            return handleSelectionChange({ shiftKey, item });
        },
        [activeStories, tree],
    );

    useEventListener('keydown', handleKeyDownInMenu);

    const renderItem = renderProps => (
        <StoryGroupTreeNode
            {...renderProps}
            somethingIsMutating={somethingIsMutating}
            activeStories={activeStories}
            handleSelectionChange={handleSelectionChange}
            setDeletionModalVisible={setDeletionModalVisible}
            handleToggleExpansion={handleToggleExpansion}
            handleCollapse={handleCollapse}
            handleAddStory={handleAddStory}
            handleToggleFocus={handleToggleFocus}
            handleRenameItem={handleRenameItem}
        />
    );

    const [deletionIsPossible, deletionModalMessage] = useMemo(
        () => isStoryDeletable(deletionModalVisible, stories, tree),
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
                            onChangeActiveStories(
                                activeStories.filter(
                                    s => s.id !== deletionModalVisible.id,
                                ),
                            );
                            setDeletionModalVisible(false);
                        },
                    }
                    : {})}
                {...(deletionIsPossible ? {} : { confirmButton: null })}
            />
            {somethingIsDragging && activeStories.length > 1 && (
                <Portal
                    open
                    mountNode={document.getElementsByClassName('drag-handle dragging')[0]}
                >
                    <div className='count-tooltip'>{activeStories.length}</div>
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
}

StoryGroupTree.propTypes = {
    storyGroups: PropTypes.array.isRequired,
    stories: PropTypes.array.isRequired,
    onChangeActiveStories: PropTypes.func.isRequired,
    activeStories: PropTypes.array,
    isStoryDeletable: PropTypes.func,
};

StoryGroupTree.defaultProps = {
    activeStories: [],
    isStoryDeletable: () => [true, 'Delete?'],
};
