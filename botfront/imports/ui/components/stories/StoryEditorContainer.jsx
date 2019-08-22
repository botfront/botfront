import {
    Icon, Segment, Menu, Button,
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
import './style.import.less';

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
    const [deletePopupOpened, openDeletePopup] = useState(false);
    const [movePopupOpened, openMovePopup] = useState(false);
    const [moveDestination, setMoveDestination] = useState(null);
    const [activePath, setActivePath] = useState(story._id);

    const getBranchesAndIndices = path => path.split('__').slice(1)
        // gets branches but also indices, useful for setting later
        .reduce((acc, val) => {
            const index = acc.branches.findIndex(b => b._id === val);
            return {
                branches: acc.branches[index].branches || [],
                story: acc.branches[index].story,
                title: acc.branches[index].title,
                indices: [...acc.indices, index],
            };
        }, {
            branches: story.branches || [], story, title: story.title, indices: [],
        });

    // activePathProps contains activePath's branches, story, title...
    const [activePathProps, setActivePathProps] = useState(getBranchesAndIndices(story._id));
    useEffect(() => {
        setActivePathProps(getBranchesAndIndices(activePath));
    }, [activePath, story]);

    const saveStory = (pathOrIndices, content) => {
        // this accepts a double__underscore-separated path or an array of indices
        onSaving();
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
            setMoveDestination={setMoveDestination}
            onDelete={onDelete}
            onMove={onMove}
            movePopupOpened={movePopupOpened}
            moveDestination={moveDestination}
            openDeletePopup={openDeletePopup}
            openMovePopup={openMovePopup}
            deletePopupOpened={deletePopupOpened}
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
                return parseInt(branch.title.match(/New Branch (\d+)$/)[1], 10); }
            return 0;
        });
        const newBranchNum = Math.max(0, ...branchNums) + offset;
        return `New Branch ${newBranchNum + 1}`;
    };

    const handleCreateBranch = (indices, branches = [], num = 1) => {
        const newBranches = [...new Array(num)].map((_, i) => (
            {
                title: getNewBranchName(branches, i),
                story: '',
                branches: [],
                _id: shortid.generate(),
            }
        ));
        saveStory(indices, { branches: [...branches, ...newBranches] });
    };

    const handleDeleteBranch = (indices, index, branches) => {
        // to do: if branches.length < 3 ...
        const updatedBranches = [...branches.slice(0, index), ...branches.slice(index + 1)];
        setActivePath(story._id); // temp fix: need to determine most natural branch to switch to
        saveStory(indices, { branches: updatedBranches });
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
            <Segment attached>
                {editorType !== 'visual' ? renderAceEditor(path) : null}
                { branches.length > 0 && (
                    <Menu tabular>
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
                                />
                            );
                        })}
                        <Menu.Item key={`${path}-add`} onClick={() => handleCreateBranch(indices, branches)}>
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
            <Segment attached='bottom'>
                <Button
                    content={!!activePathProps.branches.length ? `${activePathProps.title} branched` : `Branch ${activePathProps.title}`}
                    color='grey'
                    onClick={() => handleCreateBranch(activePathProps.indices, activePathProps.branches, 2)}
                    fluid
                    disabled={!!activePathProps.branches.length}
                />
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
