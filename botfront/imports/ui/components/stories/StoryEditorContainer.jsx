import {
    Icon, Segment, Menu, Button,
} from 'semantic-ui-react';
import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import { set as _set } from 'lodash';
import shortid from 'shortid';
import { StoryController } from '../../../lib/story_controller';
import { ConversationOptionsContext } from '../utils/Context';
import StoryTopMenu from './StoryTopMenu';
import { wrapMeteorCallback } from '../utils/Errors';
import 'brace/theme/github';
import 'brace/mode/text';
import './style.import.less';

const StoryEditorContainer = ({
    story,
    disabled,
    onDelete,
    onClone,
    onMove,
    groupNames,
    onRename,
    editor: editorType,
    onSaving,
    onSaved,
}) => {
    const { slots } = useContext(ConversationOptionsContext);
    const [deletePopupOpened, openDeletePopup] = useState(false);
    const [movePopupOpened, openMovePopup] = useState(false);
    const [moveDestination, setMoveDestination] = useState(null);
    // const [editor, setEditor] = useState();
    const [newTitle, setNewTitle] = useState(story.title);
    const [activePath, setActivePath] = useState();
    const [storyBranches, setStoryBranches] = useState(story.branches);

    function saveStory(path, content) {
        onSaving();
        const { indices } = getBranchesAndIndices(path);
        Meteor.call(
            'stories.update',
            { _id: story._id, ...content, indices },
            wrapMeteorCallback(() => onSaved()),
        );
    }

    const [storyControllers, setStoryControllers] = useState({
        [story._id]: new StoryController( // the root story
            story.story || '',
            slots,
            () => {},
            content => saveStory(story._id, { story: content }),
        ),
    });

    // sets annotations directly on the ace editor, bypassing the react component
    // We bypass react-ace because annotations are buggy on it
    /* useEffect(() => {
        if (editor) {
            editor.getSession().setAnnotations(annotations);
        }
    }, [annotations, story]); */

    /* useEffect(() => {
        setNewTitle(story.title);
        setStoryBranches(story.branches);
    }, [story]); */

    const renderTopMenu = () => (
        <StoryTopMenu
            title={story.title}
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            setMoveDestination={setMoveDestination}
            onDelete={onDelete}
            onMove={onMove}
            movePopupOpened={movePopupOpened}
            moveDestination={moveDestination}
            openDeletePopup={openDeletePopup}
            openMovePopup={openMovePopup}
            deletePopupOpened={deletePopupOpened}
            disabled={disabled}
            onRename={onRename}
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

    const getNewBranchName = (branches) => {
        const numNewBranches = branches.filter(branch => branch.title.search('New Branch') === 0).length;
        return `New Branch${numNewBranches < 1 ? '' : numNewBranches + 1}`;
    };

    const getBranchesAndIndices = path => path.split('__').slice(1) // gets branches but also indices, useful for setting later
        .reduce((acc, val) => {
            const index = acc.branches.findIndex(b => b._id === val);
            return {
                branches: acc.branches[index].branches,
                story: acc.branches[index].story,
                indices: [...acc.indices, index],
            };
        }, { branches: storyBranches, story, indices: [] });

    const handleCreateBranch = (indices, branches = [], num = 1) => {
        const path = indices.reduce((acc, val) => `${acc}${acc ? '.' : ''}${val}.branches`, '');
        const updatedBranches = [...storyBranches];
        const newBranches = [];
        for (let i = 0; i < num; i += 1) {
            newBranches.push({
                title: getNewBranchName([...branches, ...newBranches]),
                story: '',
                _id: shortid.generate(),
            });
        }
        if (path) _set(updatedBranches, path, [...branches, ...newBranches]);
        else updatedBranches.push(...newBranches);

        setStoryBranches(updatedBranches);
        saveStory(path, { branches: updatedBranches });
    };

    const handleRenameBranch = (indices, index, newName) => {
        let path = indices.reduce((acc, val) => `${acc}${acc ? '.' : ''}${val}.branches`, '');
        path = `${path}.${index}.title`;
        const updatedBranches = [...storyBranches];
        _set(updatedBranches, path, newName);
        setStoryBranches(updatedBranches);
        saveStory(path, { branches: updatedBranches });
    };

    const handleDeleteBranch = (indices, index, branches) => {
        const path = indices.reduce((acc, val) => `${acc}${acc ? '.' : ''}${val}.branches`, '');
        const updatedBranches = [...storyBranches];
        const newBranches = [...branches.slice(0, index), ...branches.slice(index + 1)];
        _set(updatedBranches, path, newBranches);
        setStoryBranches(updatedBranches);
        saveStory(path, { branches: updatedBranches });
    };

    const handleSwitchBranch = (path) => { // will instantiate a storyController if it doesn't exist
        if (!storyControllers[path] || !(storyControllers[path] instanceof StoryController)) {
            const { story: branchStory } = getBranchesAndIndices(path);
            setStoryControllers({
                ...storyControllers,
                [path]: new StoryController(
                    branchStory || '',
                    slots,
                    () => {},
                    content => saveStory(path, { story: content }),
                ),
            });
        }
        setActivePath(path);
    };

    const renderBranches = (path) => {
        const { branches, indices } = getBranchesAndIndices(path);
        const query = new RegExp(`(${path}__.*?)(__|$)`);
        const queriedPath = activePath || story._id;
        const nextPath = queriedPath.match(query) && queriedPath.match(query)[1];
        return (
            <>
                {editorType !== 'visual' ? renderAceEditor(path) : null}
                { branches && branches.length && (
                    <Menu tabular>
                        { branches.map((branch, index) => {
                            const childPath = `${path}__${branch._id}`;
                            return (
                                <Menu.Item
                                    key={childPath}
                                    name={branch.title}
                                    active={activePath // activePath starts with branch's path
                                        && (activePath === childPath || activePath.indexOf(`${childPath}__`) === 0)}
                                    onClick={() => {
                                        if (activePath // do no change activePath if clicked branch is an ancestor
                                            && activePath.indexOf(`${childPath}__`) === 0) return;
                                        handleSwitchBranch(childPath);
                                    }}
                                    // onRename={newName => handleRenameBranch(indices, index, newName)}
                                    // onDelete={() => handleDeleteBranch(indices, index, branches)}
                                />
                            );
                        })}
                        <Menu.Item key={`${path}-add`} onClick={() => handleCreateBranch(indices, branches)}>
                            <Icon name='plus' />
                        </Menu.Item>
                    </Menu>
                )}
                { (!branches || !branches.length) && (
                    <Button
                        content='branch it!'
                        color='violet'
                        onClick={() => handleCreateBranch(indices, branches, 2)}
                    />
                )}
                { branches && branches.length && activePath && nextPath && ( // render branch content
                    renderBranches(nextPath)
                )}
            </>
        );
    };

    return (
        <div className='story-editor' data-cy='story-editor'>
            {renderTopMenu()}
            <Segment attached>
                {renderBranches(story._id)}
                <br />
            </Segment>
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
