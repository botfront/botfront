import {
    Icon, Segment, Menu,
} from 'semantic-ui-react';
import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import { set as _set } from 'lodash';
import { StoryController } from '../../../lib/story_controller';
import { ConversationOptionsContext } from '../utils/Context';
import StoryTopMenu from './StoryTopMenu';
import 'brace/theme/github';
import 'brace/mode/text';
import './style.import.less';

const StoryEditorContainer = ({
    story,
    disabled,
    onChange,
    onDelete,
    annotations,
    title,
    onClone,
    onMove,
    groupNames,
    onRename,
    editor: editorType,
    branches: BRANCHES,
}) => {
    const [deletePopupOpened, openDeletePopup] = useState(false);
    const [movePopupOpened, openMovePopup] = useState(false);
    const [moveDestination, setMoveDestination] = useState(null);
    const [editor, setEditor] = useState();
    const [newTitle, setNewTitle] = useState(title);
    const [activePath, setActivePath] = useState();
    const [storyBranches, setStoryBranches] = useState(BRANCHES);
    const [editedStories, setEditedStories] = useState({
        [title]: story,
    });
    const { slots } = useContext(ConversationOptionsContext);

    // sets annotations directly on the ace editor, bypassing the react component
    // We bypass react-ace because annotations are buggy on it
    useEffect(() => {
        if (editor) {
            editor.getSession().setAnnotations(annotations);
        }
    }, [annotations, story]);

    useEffect(() => {
        setNewTitle(title);
    }, [title]);

    useEffect(() => {
        setStoryBranches(BRANCHES);
    }, [BRANCHES]);

    const renderTopMenu = () => (
        <StoryTopMenu
            title={title}
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

    const renderAceEditor = storyToDisplay => (
        <AceEditor
            readOnly={disabled}
            onLoad={setEditor}
            theme='github'
            width='100%'
            name='story'
            mode='text'
            minLines={5}
            maxLines={Infinity}
            fontSize={12}
            onChange={onChange}
            value={storyToDisplay ? storyToDisplay.unsafeMd : ''}
            showPrintMargin={false}
            showGutter
            annotations={annotations}
            editorProps={{
                $blockScrolling: Infinity,
            }}
            setOptions={{
                tabSize: 2,
                // the worker has a bug which removes annotations
                useWorker: false,
            }}
        />
    );

    const getNewBranchName = (branches) => {
        const numNewBranches = branches.filter(branch => branch.title.search('New Branch') === 0).length;
        return `New Branch${numNewBranches < 1 ? '' : numNewBranches + 1}`;
    };

    const getBranchesAndIndices = path => path.split('__').slice(1) // gets branches but also indices, useful for setting later
        .reduce((acc, val) => {
            const index = acc.branches.findIndex(b => b.title === val);
            return {
                branches: acc.branches[index].branches,
                story: acc.branches[index].story,
                indices: [...acc.indices, index],
            };
        }, { branches: storyBranches, story, indices: [] });

    const handleCreateBranch = (branches, indices) => {
        const path = indices.reduce((acc, val) => `${acc}${acc ? '.' : ''}${val}.branches`, '');
        const newBranch = { title: getNewBranchName(branches), story: '* replace_with_intent' };
        const newBranches = [...storyBranches];
        if (path) _set(newBranches, path, [...branches, newBranch]);
        else newBranches.push(newBranch);
        setStoryBranches(newBranches);
    };

    const handleSwitchBranch = (path) => { // will instantiate a storyController if it doesn't exist
        if (!editedStories[path] || !(editedStories[path] instanceof StoryController)) {
            const { story: branchStory } = getBranchesAndIndices(path);
            setEditedStories({
                ...editedStories,
                [path]: new StoryController(branchStory, slots),
            });
        }
        setActivePath(path);
    };

    const renderBranches = (path) => {
        const { branches, indices } = getBranchesAndIndices(path);
        const storyToDisplay = editedStories[path];
        const query = new RegExp(`(${path}__.*?)(__|$)`);
        const queriedPath = activePath || newTitle;
        const nextPath = queriedPath.match(query) && queriedPath.match(query)[1];
        return (
            <>
                {editorType !== 'visual' ? renderAceEditor(storyToDisplay) : null}
                { branches && branches.length && (
                    <Menu tabular>
                        { branches.map((branch) => {
                            const childPath = `${path}__${branch.title}`;
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
                                />
                            );
                        })}
                        <Menu.Item key={`${path}-add`} onClick={() => handleCreateBranch(branches, indices)}>
                            <Icon name='plus' />
                        </Menu.Item>
                    </Menu>
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
            <Segment attached='bottom'>
                {renderBranches(newTitle)}
                <br />
            </Segment>
        </div>
    );
};

StoryEditorContainer.propTypes = {
    story: PropTypes.instanceOf(StoryController),
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    annotations: PropTypes.array,
    title: PropTypes.string.isRequired,
    onClone: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    groupNames: PropTypes.array.isRequired,
    onRename: PropTypes.func.isRequired,
    branches: PropTypes.array,
    editor: PropTypes.string,
};

StoryEditorContainer.defaultProps = {
    disabled: false,
    story: '',
    annotations: [],
    branches: [
        {
            title: 'bleh',
            story: 'bleh story',
        },
        {
            title: 'boo',
            story: 'boo story',
            branches: [
                {
                    title: 'branch1',
                    story: 'branch1 story',
                },
                {
                    title: 'branch2',
                    story: 'branch2 story',
                    branches: [
                        {
                            title: 'brancha',
                            story: 'brancha story',
                        },
                        {
                            title: 'branchb',
                            story: 'branchb story',
                        },
                        {
                            title: 'branchc',
                            story: 'branchc story',
                        },
                    ],
                },
                {
                    title: 'branch3',
                    story: 'branch3 story',
                },
            ],
        },
        {
            title: 'bah',
            story: 'bah story',
        },
        {
            title: 'hurk',
            story: 'hurk story',
        },
        {
            title: 'hlargh',
            story: 'hlargh story',
        },
    ],
    editor: 'markdown',
};

export default StoryEditorContainer;
