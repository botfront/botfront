import {
    Icon, Segment, Menu,
} from 'semantic-ui-react';
import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import shortid from 'shortid';
import { StoryController } from '../../../lib/story_controller';
import { ConversationOptionsContext } from '../utils/Context';
import { traverseStory, getSubBranchesForPath } from '../../../lib/story.utils';
import StoryTopMenu from './StoryTopMenu';
import BranchTabLabel from './BranchTabLabel';
import { wrapMeteorCallback } from '../utils/Errors';
import 'brace/theme/github';
import 'brace/mode/text';

import StoryFooter from './StoryFooter';

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
}) => {
    const { slots } = useContext(ConversationOptionsContext);
    // an array of ids, representing the path into the story
    const [branchPath, setBranchPath] = useState([story._id]);
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

    const renderTopMenu = () => (
        <StoryTopMenu
            title={story.title}
            onDelete={onDelete}
            onMove={onMove}
            disabled={disabled}
            onRename={onRenameStory}
            onClone={onClone}
            groupNames={groupNames}
        />
    );

    const renderAceEditor = path => (
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
            onChange={newStory => storyControllers[path].setMd(newStory)}
            value={storyControllers[path] ? storyControllers[path].md : ''}
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
        setBranchPath(path);
    };

    const handleDeleteBranch = (path, branches, index) => {
        const parentPath = path.slice(0, path.length - 1);
        if (branches.length < 3) {
            handleSwitchBranch(parentPath);
            saveStory(parentPath, { branches: [] });
        } else {
            const updatedBranches = [...branches.slice(0, index), ...branches.slice(index + 1)];
            handleSwitchBranch(index === 0 ? [...parentPath, branches[index + 1]._id] : [...parentPath, branches[index - 1]._id]);
            saveStory(parentPath, { branches: updatedBranches });
        }
    };

    useEffect(() => {
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
        const newBranches = [...new Array(num)].map((_, i) => (
            {
                title: getNewBranchName(branches, i),
                story: '',
                projectId: story.projectId,
                branches: [],
                _id: shortid.generate().replace('_', '0'),
            }
        ));
        setNextBranchPath(
            newLevel ? [...branchPath, newBranches[0]._id] : [...branchPath.slice(0, branchPath.length - 1), newBranches[0]._id],
        );
        saveStory(path, { branches: [...branches, ...newBranches] });
    };

    const renderBranches = (depth = 0) => {
        const pathToRender = branchPath.slice(0, depth + 1);
        const branches = getSubBranchesForPath(story, pathToRender);
        return (
            <Segment attached className='single-story-container'>
                {editorType !== 'visual' ? renderAceEditor(pathToRender) : null}
                { branches.length > 0 && (
                    <Menu pointing secondary data-cy='branch-menu'>
                        { branches.map((branch, index) => {
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
                                    onDelete={() => handleDeleteBranch(childPath, branches, index)}
                                    siblings={branches}
                                />
                            );
                        })}
                        <Menu.Item key={`${pathToRender.join()}-add`} className='add-tab' onClick={() => handleCreateBranch(pathToRender, branches, 1, false)} data-cy='add-branch'>
                            <Icon name='plus' />
                        </Menu.Item>
                    </Menu>
                )}
                { branches.length > 0 && branchPath.length > pathToRender.length && ( // render branch content
                    renderBranches(depth + 1)
                )}
            </Segment>
        );
    };

    return (
        <div className='story-editor' data-cy='story-editor'>
            {renderTopMenu()}
            {renderBranches()}
            <StoryFooter
                onBranch={() => handleCreateBranch(branchPath, [], 2)}
                onContinue={() => {}}
                canContinue={false}
                // We just check if there are any branches at the current path
                // If there are, we can't branch
                canBranch={!getSubBranchesForPath(story, branchPath).length}
                storyPath={traverseStory(story, branchPath).pathTitle}
                disableContinue
            />
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
};

StoryEditorContainer.defaultProps = {
    disabled: false,
    story: '',
    editor: 'markdown',
};

export default StoryEditorContainer;
