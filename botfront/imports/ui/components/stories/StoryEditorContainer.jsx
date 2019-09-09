import React, { useState, useContext, useEffect } from 'react';
import { Icon, Segment, Menu } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import { List } from 'immutable';
import shortid from 'shortid';
import 'brace/theme/github';
import 'brace/mode/text';

import { traverseStory, getSubBranchesForPath } from '../../../lib/story.utils';
import { StoryController } from '../../../lib/story_controller';
import { ConversationOptionsContext } from '../utils/Context';
import { setStoryPath } from '../../store/actions/actions';
import { wrapMeteorCallback } from '../utils/Errors';
import BranchTabLabel from './BranchTabLabel';
import StoryTopMenu from './StoryTopMenu';
import StoryFooter from './StoryFooter';

function getDefaultPath(story) {
    if (!story.branches) return [story._id];
    const newPath = [story._id];
    let newLevel = story.branches.length;
    let branches = [...story.branches];
    while (newLevel) {
        newPath.push(branches[0]._id);
        newLevel = branches[0].branches.length;
        branches = [...branches[0].branches];
    }
    return newPath;
}

const StoryEditorContainer = ({
    story,
    disabled,
    onDelete,
    onClone,
    onMove,
    groupNames,
    onRename: onRenameStory,
    editor: editorType,
    onSaving,
    onSaved,
    branchPath,
    changeStoryPath,
    collapsed,
}) => {
    const { slots } = useContext(ConversationOptionsContext);
    // The next path to go to when a change is made, we wait for the story prop to be updated to go that path
    // useful when we add branch for instance, we have to wait for the branches to actually be in the db
    // set to null when we don't want to go anywhere
    const [nextBranchPath, setNextBranchPath] = useState(null);

    const saveStory = (path, content) => {
        onSaving();
        Meteor.call(
            'stories.update',
            { _id: story._id, ...content, path },
            wrapMeteorCallback(() => onSaved()),
        );
    };

    const [storyControllers, setStoryControllers] = useState({
        [story._id]: new StoryController( // the root story
            story.story || '',
            slots,
            () => {},
            content => saveStory([story._id], { story: content }),
        ),
    });

    // This is to make sure that all opened branches have corresponding storyController objects
    // attached to them.
    useEffect(() => {
        const newStoryControllers = {};
        branchPath.forEach((_, index) => {
            const currentPath = branchPath.slice(0, index + 1);
            if (!storyControllers[currentPath.join()]) {
                const newStory = traverseStory(story, branchPath.slice(0, index + 1));
                newStoryControllers[currentPath.join()] = new StoryController(
                    newStory.story || '',
                    slots,
                    () => {},
                    content => saveStory(currentPath, { story: content }),
                );
            }
        });
        setStoryControllers({
            ...storyControllers,
            ...newStoryControllers,
        });
    }, [branchPath]);

    const renderTopMenu = () => (
        <StoryTopMenu
            title={story.title}
            storyId={story._id}
            onDelete={onDelete}
            onMove={onMove}
            disabled={disabled}
            onRename={onRenameStory}
            onClone={onClone}
            groupNames={groupNames}
        />
    );

    const renderAceEditor = (path) => {
        const pathAsString = path.join();
        return (
            <AceEditor
                readOnly={disabled}
                // onLoad={setEditor}
                theme='github'
                width='100%'
                name='story'
                mode='text'
                minLines={5}
                maxLines={Infinity}
                fontSize={12}
                onChange={newStory => storyControllers[pathAsString].setMd(newStory)}
                value={
                    storyControllers[pathAsString]
                        ? storyControllers[pathAsString].md
                        : ''
                }
                showPrintMargin={false}
                showGutter
                // annotations={annotations}
                editorProps={{
                    $blockScrolling: Infinity,
                }}
                setOptions={{
                    tabSize: 2,
                    useWorker: false, // the worker has a bug which removes annotations
                }}
            />
        );
    };

    const getNewBranchName = (branches, offset = 0) => {
        const branchNums = branches.map((branch) => {
            if (branch.title.match(/New Branch (\d+)$/)) {
                return parseInt(branch.title.match(/New Branch (\d+)$/)[1], 10);
            }
            return 0;
        });
        const newBranchNum = Math.max(0, ...branchNums) + offset;
        return `New Branch ${newBranchNum + 1}`;
    };

    const handleSwitchBranch = (path) => {
        const newBranch = traverseStory(story, path);
        const pathAsString = path.join();
        // will instantiate a storyController if it doesn't exist
        if (
            !storyControllers[pathAsString]
            || !(storyControllers[pathAsString] instanceof StoryController)
        ) {
            setStoryControllers({
                ...storyControllers,
                [pathAsString]: new StoryController(
                    newBranch.story || '',
                    slots,
                    () => {},
                    content => saveStory(path, { story: content }),
                ),
            });
        }
        changeStoryPath(story._id, path);
    };

    const handleDeleteBranch = (path, branches, index) => {
        const parentPath = path.slice(0, path.length - 1);
        if (branches.length < 3) {
            handleSwitchBranch(parentPath);
            // we append the remaining story to the parent one.
            const deletedStory = branches[!index ? 1 : 0].story;
            const newParentStory = `${
                storyControllers[parentPath.join()].md
            }\n${deletedStory}`;
            saveStory(parentPath, {
                branches: [],
                story: newParentStory,
            });
            storyControllers[parentPath.join()].setMd(newParentStory);
        } else {
            const updatedBranches = [
                ...branches.slice(0, index),
                ...branches.slice(index + 1),
            ];
            handleSwitchBranch(
                index === 0
                    ? [...parentPath, branches[index + 1]._id]
                    : [...parentPath, branches[index - 1]._id],
            );
            saveStory(parentPath, { branches: updatedBranches });
        }
    };

    useEffect(() => {
        // This allows awaiting for db changes before setting the active branch
        if (nextBranchPath) {
            try {
                handleSwitchBranch(nextBranchPath);
                setNextBranchPath(null);
            } catch (e) {
                //
            }
        }
    }, [story, nextBranchPath]);

    // new Level is true if the new branches create a new depth level of branches.
    const handleCreateBranch = (path, branches = [], num = 1, newLevel = true) => {
        const newBranches = [...new Array(num)].map((_, i) => ({
            title: getNewBranchName(branches, i),
            story: '',
            projectId: story.projectId,
            branches: [],
            _id: shortid.generate().replace('_', '0'),
        }));
        setNextBranchPath(
            newLevel
                ? [...branchPath, newBranches[0]._id]
                : [...path, newBranches[0]._id],
        );
        saveStory(path, { branches: [...branches, ...newBranches] });
    };

    const renderBranches = (depth = 0) => {
        //
        const pathToRender = branchPath.slice(0, depth + 1);
        let branches = [];
        // This is to handle the case where the story is modified by another user
        // and the path no longer corresponds to anything
        try {
            branches = getSubBranchesForPath(story, pathToRender);
        } catch (e) {
            changeStoryPath(story._id, getDefaultPath(story));
        }
        if (collapsed) return null;
        return (
            <Segment
                attached
                className='single-story-container'
                data-cy='single-story-editor'
            >
                {editorType !== 'visual' ? renderAceEditor(pathToRender) : null}
                {branches.length > 0 && (
                    <Menu pointing secondary data-cy='branch-menu'>
                        {branches.map((branch, index) => {
                            const childPath = [...pathToRender, branch._id];
                            return (
                                <BranchTabLabel
                                    key={childPath.join()}
                                    value={branch.title}
                                    active={branchPath.indexOf(branch._id) !== -1}
                                    onSelect={() => {
                                        // do no change activeBranch if clicked branch is already in the path
                                        if (branchPath.indexOf(branch._id) !== -1) return;
                                        handleSwitchBranch(childPath);
                                    }}
                                    onChangeName={(newName) => {
                                        saveStory(childPath, { title: newName });
                                    }}
                                    onDelete={() => handleDeleteBranch(childPath, branches, index)
                                    }
                                    siblings={branches}
                                />
                            );
                        })}
                        <Menu.Item
                            key={`${pathToRender.join()}-add`}
                            className='add-tab'
                            onClick={() => handleCreateBranch(pathToRender, branches, 1, false)
                            }
                            data-cy='add-branch'
                        >
                            <Icon name='plus' />
                        </Menu.Item>
                    </Menu>
                )}
                {branches.length > 0
                && branchPath.length > pathToRender.length // render branch content
                    && renderBranches(depth + 1)}
            </Segment>
        );
    };

    function canBranch() {
        try {
            return !getSubBranchesForPath(story, branchPath).length;
        } catch (e) {
            return !getSubBranchesForPath(story, [story._id]).length;
        }
    }

    function getStoryPath() {
        try {
            return traverseStory(story, branchPath).pathTitle;
        } catch (e) {
            return [story.title];
        }
    }

    return (
        <div className='story-editor' data-cy='story-editor'>
            {renderTopMenu()}
            {renderBranches()}
            {!collapsed && (
                <StoryFooter
                    onBranch={() => handleCreateBranch(branchPath, [], 2)}
                    onContinue={() => {}}
                    canContinue={false}
                    // We just check if there are any branches at the current path
                    // If there are, we can't branch
                    canBranch={canBranch()}
                    storyPath={getStoryPath()}
                    disableContinue
                />
            )}
        </div>
    );
};

StoryEditorContainer.propTypes = {
    story: PropTypes.object,
    disabled: PropTypes.bool,
    onDelete: PropTypes.func.isRequired,
    onClone: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    groupNames: PropTypes.array.isRequired,
    onRename: PropTypes.func.isRequired,
    editor: PropTypes.string,
    onSaving: PropTypes.func.isRequired,
    onSaved: PropTypes.func.isRequired,
    branchPath: PropTypes.array,
    changeStoryPath: PropTypes.func.isRequired,
    collapsed: PropTypes.bool.isRequired,
};

StoryEditorContainer.defaultProps = {
    disabled: false,
    story: '',
    editor: 'markdown',
    branchPath: null,
};

const mapStateToProps = (state, ownProps) => ({
    branchPath: state.stories
        .getIn(
            ['savedStoryPaths', ownProps.story._id],
            List(getDefaultPath(ownProps.story)),
        )
        .toJS(),
    collapsed: state.stories.getIn(['storiesCollapsed', ownProps.story._id], false),
});

const mapDispatchToProps = {
    changeStoryPath: setStoryPath,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(StoryEditorContainer);
