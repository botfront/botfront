import {
    Icon, Segment, Menu,
} from 'semantic-ui-react';
import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import shortid from 'shortid';
import { StoryController } from '../../../lib/story_controller';
import { ConversationOptionsContext } from '../utils/Context';
import { traverseStory } from '../../../lib/story.utils';
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
    const [activeBranch, setActiveBranch] = useState(traverseStory(story, story._id));
    const [newBranchPath, setNewBranchPath] = useState('');

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
            content => saveStory(story._id, { story: content }),
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

    const handleDeleteBranch = (path, branches, index) => {
        const commonPath = path.match(/.*__/) ? path.match(/.*__/)[0] : story._id;
        const parentPath = commonPath.match(/(.*)__/)[1];
        const updatedBranches = branches.length < 3
            ? []
            : [...branches.slice(0, index), ...branches.slice(index + 1)];
        const newPath = branches.length < 3
            ? parentPath
            : `${commonPath}${branches[index + 1] ? branches[index + 1]._id : branches[index - 1]._id}`;
        setNewBranchPath(newPath);
        saveStory(parentPath, { branches: updatedBranches });
    };

    const handleSwitchBranch = (path) => {
        const newBranch = traverseStory(story, path);
        // will instantiate a storyController if it doesn't exist
        if (
            !storyControllers[path]
            || !(storyControllers[path] instanceof StoryController)
        ) {
            setStoryControllers({
                ...storyControllers,
                [path]: new StoryController(
                    newBranch.story || '',
                    slots,
                    () => {},
                    content => saveStory(path, { story: content }),
                ),
            });
        }
        setActiveBranch(newBranch);
    };

    useEffect(() => {
        if (newBranchPath) {
            try {
                handleSwitchBranch(newBranchPath);
                setNewBranchPath('');
            } catch (e) {
                //
            }
        }
    }, [story]);

    // new Level is true if the new branches create a new depth level of branches.
    const handleCreateBranch = (path, branches = [], num = 1, newLevel = true) => {
        const commonPath = path.match(/.*__/) ? path.match(/.*__/)[0] : story._id;
        const newBranches = [...new Array(num)].map((_, i) => (
            {
                title: getNewBranchName(branches, i),
                story: '',
                projectId: story.projectId,
                branches: [],
                _id: shortid.generate().replace('_', '0'),
            }
        ));
        setNewBranchPath(
            !newLevel ? `${commonPath}__${newBranches[0]._id}` : `${path}__${newBranches[0]._id}`,
        );
        saveStory(path, { branches: [...branches, ...newBranches] });
    };

    const renderBranches = (path) => {
        const { branches } = traverseStory(story, path);
        const query = new RegExp(`(${path}__.*?)(__|$)`);
        const queriedPath = activeBranch.path || story._id;
        const nextPath = queriedPath.match(query) && queriedPath.match(query)[1];
        return (
            <Segment attached className='single-story-container'>
                {editorType !== 'visual' ? renderAceEditor(path) : null}
                { branches.length > 0 && (
                    <Menu pointing secondary data-cy='branch-menu'>
                        { branches.map((branch, index) => {
                            const childPath = `${path}__${branch._id}`;
                            return (
                                <BranchTabLabel
                                    key={childPath}
                                    value={branch.title}
                                    active={activeBranch // activeBranch starts with branch's path
                                        && (activeBranch.path === childPath || activeBranch.path.indexOf(`${childPath}__`) === 0)}
                                    onSelect={() => {
                                        if (activeBranch // do no change activeBranch if clicked branch is an ancestor
                                            && activeBranch.path.indexOf(`${childPath}__`) === 0) return;
                                        handleSwitchBranch(childPath);
                                    }}
                                    onChangeName={(newName) => {
                                        saveStory(childPath, { title: newName });
                                        setNewBranchPath(`${activeBranch.pathTitle.match(/.*__/)[0]}${newName}`);
                                    }}
                                    onDelete={() => handleDeleteBranch(childPath, branches, index)}
                                    siblings={branches}
                                />
                            );
                        })}
                        <Menu.Item key={`${path}-add`} className='add-tab' onClick={() => handleCreateBranch(path, branches, 1, false)} data-cy='add-branch'>
                            <Icon name='plus' />
                        </Menu.Item>
                    </Menu>
                )}
                { branches.length > 0 && activeBranch && nextPath && ( // render branch content
                    renderBranches(nextPath)
                )}
            </Segment>
        );
    };

    return (
        <div className='story-editor' data-cy='story-editor'>
            {renderTopMenu()}
            {renderBranches(story._id)}
            <StoryFooter
                onBranch={() => handleCreateBranch(activeBranch.path, activeBranch.branches, 2)}
                onContinue={() => {}}
                canContinue={false}
                canBranch={!activeBranch.branches.length}
                storyPath={activeBranch.pathTitle}
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
