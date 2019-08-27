import {
    Icon, Segment, Menu,
} from 'semantic-ui-react';
import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import shortid from 'shortid';
import { StoryController } from '../../../lib/story_controller';
import { ConversationOptionsContext } from '../utils/Context';
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
    const [activePath, setActivePath] = useState(story._id);

    const getBranchesAndIndices = path => path
        .split('__')
        .slice(1)
    // gets branches but also indices, useful for setting later
        .reduce(
            (accumulateur, value) => {
                const index = accumulateur.branches.findIndex(
                    branch => branch._id === value,
                );
                return {
                    branches: accumulateur.branches[index].branches ? [...accumulateur.branches[index].branches] : [],
                    story: accumulateur.branches[index].story,
                    title: accumulateur.branches[index].title,
                    // Indices are the path in numeric form, for instance, the second branch into the first branch
                    // would hae the indices looking like [0, 1], so first branch then second branch.
                    indices: [...accumulateur.indices, index],
                    pathTitle: `${accumulateur.pathTitle}__${
                        accumulateur.branches[index].title
                    }`,
                };
            },
            {
                branches: story.branches ? [...story.branches] : [],
                story,
                title: story.title,
                indices: [],
                pathTitle: story.title,
            },
        );

    // activePathProps contains activePath's branches, story, title...
    const [activePathProps, setActivePathProps] = useState(getBranchesAndIndices(story._id));
    const [newBranchPath, setNewBranchPath] = useState('');

    useEffect(() => {
        setActivePathProps(getBranchesAndIndices(activePath));
    }, [activePath]);

    const saveStory = (pathOrIndices, content) => {
        // this accepts a double__underscore-separated path or an array of indices
        onSaving();
        // if pathOrIndices is an indice, we just take it, if not we calculate it
        const { indices } = pathOrIndices instanceof Array
            ? { indices: pathOrIndices }
            : getBranchesAndIndices(pathOrIndices);
        Meteor.call(
            'stories.update',
            { _id: story._id, ...content, indices },
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

    const handleDeleteBranch = (indices, index, branches) => {
        const commonActivePath = activePath.match(/.*__/)[0];
        const updatedBranches = branches.length < 3
            ? []
            : [...branches.slice(0, index), ...branches.slice(index + 1)];
        const newPath = branches.length < 3
            ? commonActivePath.match(/(.*)__/)[1]
            : `${commonActivePath}${branches[index + 1] ? branches[index + 1]._id : branches[index - 1]._id}`;
        setActivePath(newPath);
        saveStory(indices, { branches: updatedBranches });
    };

    const handleSwitchBranch = (path) => {
        // will instantiate a storyController if it doesn't exist
        if (
            !storyControllers[path]
            || !(storyControllers[path] instanceof StoryController)
        ) {
            const { story: branchStory } = getBranchesAndIndices(path);
            setStoryControllers({
                ...storyControllers,
                [path]: new StoryController(
                    branchStory || '',
                    slots,
                    () => {},
                    content => Meteor.call(
                        'stories.updateBranch',
                        story,
                        path,
                        content,
                        wrapMeteorCallback(),
                    ),
                ),
            });
        }
        setActivePath(path);
    };

    useEffect(() => {
        setActivePathProps(getBranchesAndIndices(activePath));
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
    const handleCreateBranch = (indices, branches = [], num = 1, newLevel = true) => {
        const firstBranchId = shortid.generate();
        const arrayPath = activePath.split('__');
        const newBranches = [...new Array(num)].map((_, i) => (
            {
                title: getNewBranchName(branches, i),
                story: '',
                projectId: story.projectId,
                branches: [],
                _id: i === 0 ? firstBranchId : shortid.generate(),
            }
        ));
        if (!newLevel) {
            const pathWitouthLastBranch = arrayPath.slice(0, arrayPath.length - 1).join('__');
            setNewBranchPath(`${pathWitouthLastBranch}__${firstBranchId}`);
            saveStory(indices, { branches: [...branches, ...newBranches] });
            return;
        }
        setNewBranchPath(`${activePath}__${firstBranchId}`);
        saveStory(indices, { branches: [...branches, ...newBranches] });
    };

    const renderBranches = (path) => {
        const { branches, indices } = getBranchesAndIndices(path);
        const query = new RegExp(`(${path}__.*?)(__|$)`);
        const queriedPath = activePath || story._id;
        const nextPath = queriedPath.match(query) && queriedPath.match(query)[1];
        return (
            <Segment attached className='single-story-container'>
                {editorType !== 'visual' ? renderAceEditor(path) : null}
                { branches.length > 0 && (
                    <Menu pointing secondary>
                        { branches.map((branch, index) => {
                            const childPath = `${path}__${branch._id}`;
                            return (
                                <BranchTabLabel
                                    key={childPath}
                                    value={branch.title}
                                    active={activePath // activePath starts with branch's path
                                        && (activePath === childPath || activePath.indexOf(`${childPath}__`) === 0)}
                                    onSelect={() => {
                                        if (activePath // do no change activePath if clicked branch is an ancestor
                                            && activePath.indexOf(`${childPath}__`) === 0) return;
                                        handleSwitchBranch(childPath);
                                    }}
                                    onChangeName={newName => saveStory([...indices, index], { title: newName })}
                                    onDelete={() => handleDeleteBranch(indices, index, branches)}
                                    siblings={branches}
                                />
                            );
                        })}
                        <Menu.Item key={`${path}-add`} className='add-tab' onClick={() => handleCreateBranch(indices, branches, 1, false)}>
                            <Icon name='plus' />
                        </Menu.Item>
                    </Menu>
                )}
                { branches.length > 0 && activePath && nextPath && ( // render branch content
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
                className='bread-crumb-container'
                onBranch={() => handleCreateBranch(activePathProps.indices, activePathProps.branches, 2)}
                onContinue={() => {}}
                canContinue={false}
                canBranch={!activePathProps.branches.length}
                storyPath={activePathProps.pathTitle}
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
