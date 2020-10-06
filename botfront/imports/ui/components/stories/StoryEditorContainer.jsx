import React, {
    useState, useContext, useEffect, useReducer,
} from 'react';
import { Icon, Segment, Menu } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import { List as IList } from 'immutable';
import shortid from 'shortid';
import 'brace/theme/github';
import 'brace/mode/text';

import {
    traverseStory,
    getSubBranchesForPath,
    accumulateExceptions,
} from '../../../lib/story.utils';
import { StoryController } from '../../../lib/story_controller';
import { ConversationOptionsContext } from './Context';
import { ProjectContext } from '../../layouts/context';
import { setStoryPath } from '../../store/actions/actions';
import StoryVisualEditor from './common/StoryVisualEditor';
import StoryErrorBoundary from './StoryErrorBoundary';
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
    storyMode,
    branchPath,
    changeStoryPath,
    collapsed,
}) => {
    const { stories, getResponseLocations, reloadStories } = useContext(ConversationOptionsContext);
    const { slots } = useContext(ProjectContext);
    const isLegacy = 'story' in story; // legacy (Md) stories use the Ace Editor
    
    // Used to store ace editors instance to dynamically set annotations
    // the ace edtior react component has a bug where it does not set properly
    // so we have to use this workaround
    const [editors, setEditors] = useState({});
    const [exceptions, setExceptions] = useState({});
    const [destinationStory, setDestinationStory] = useState(null);
    const [destinationStories, setDestinationStories] = useState([]);
    const hasCheckpoints = () => !!(story.checkpoints && story.checkpoints.length > 0);
    const [lastMdType, setLastMdType] = useReducer(() => Date.now(), 0);
    const saveStory = (path, content, options = {}) => {
        Meteor.call(
            'stories.update',
            {
                _id: story._id,
                ...content,
                path: typeof path === 'string' ? [path] : path,
                projectId: story.projectId,
            },
            options,
            wrapMeteorCallback(options.callback || (() => {})),
        );
    };

    const [storyControllers, setStoryControllers] = useState({
        [story._id]: new StoryController({ // the root story
            story: story.story || '',
            slots,
            onUpdate: (content, options) => saveStory(story._id, { story: content }, options),
            onMdType: setLastMdType,
            isABranch: hasCheckpoints(),
        }),
    });

    useEffect(() => {
        Object.values(storyControllers).forEach(sc => sc.updateSlots(slots));
    }, [slots]);
    
    useEffect(() => {
        const change = storyControllers[story._id].isABranch !== hasCheckpoints();
        if (change) storyControllers[story._id].setIsBranch(hasCheckpoints());
    }, [hasCheckpoints()]);

    const isBranchLinked = branchId => (
        destinationStories
            .some(aStory => ((aStory.checkpoints || [])
                .some(checkpointPath => (checkpointPath
                    .includes(branchId)
                )))));

    useEffect(() => {
        const newDestinationStories = stories.filter(aStory => branchPath.some(
            storyId => (aStory.checkpoints || []).some(checkpointPath => checkpointPath.includes(storyId)),
        ));
        const newDestinationStory = newDestinationStories.find(aStory => (aStory.checkpoints || [])
            .some(checkpoint => checkpoint[checkpoint.length - 1] === branchPath[branchPath.length - 1]));
        setDestinationStories(newDestinationStories);
        setDestinationStory(newDestinationStory);
    }, [branchPath, stories]);

    function onDestinationStorySelection(event, { value }) {
        if (value === '') {
            Meteor.call('stories.removeCheckpoints', destinationStory._id, branchPath);
        } else if (value && destinationStory) {
            Meteor.call('stories.removeCheckpoints', destinationStory._id, branchPath, () => Meteor.call(
                'stories.addCheckpoints', value, branchPath,
            ));
        } else {
            Meteor.call('stories.addCheckpoints', value, branchPath);
        }
    }

    // This is to make sure that all opened branches have corresponding storyController objects
    // attached to them.
    useEffect(() => {
        const newStoryControllers = {};
        branchPath.forEach((_, index) => {
            const currentPath = branchPath.slice(0, index + 1);
            if (!storyControllers[currentPath.join()]) {
                const newStory = traverseStory(story, branchPath.slice(0, index + 1));
                newStoryControllers[currentPath.join()] = new StoryController({
                    story: newStory.story || '',
                    slots,
                    onUpdate: (content, options) => saveStory(currentPath, { story: content }, options),
                    onMdType: setLastMdType,
                    isABranch: currentPath.length > 1,
                });
            }
        });
        setStoryControllers({
            ...storyControllers,
            ...newStoryControllers,
        });
    }, [branchPath]);

    const GetExceptionsLengthByType = exceptionType => (
        // valid types are "errors" and "warnings"
        exceptions[story._id] && exceptions[story._id][exceptionType]
            ? exceptions[story._id][exceptionType]
            : []
    );

    const getInitIntent = () => {
        try {
            return (storyControllers[story._id].lines[0].gui.type === 'user'
                ? storyControllers[story._id].lines[0].gui.data[0].intent
                : undefined);
        } catch (err) {
            return undefined;
        }
    };

    const renderTopMenu = () => (
        <StoryTopMenu
            title={story.title}
            storyId={story._id}
            disabled={disabled}
            errors={GetExceptionsLengthByType('errors')}
            warnings={GetExceptionsLengthByType('warnings')}
            isDestinationStory={story.checkpoints && story.checkpoints.length > 0}
            originStories={story.checkpoints}
            initPayload={getInitIntent()}
        />
    );


    const convertToAnnotations = (pathAsString) => {
        if (!storyControllers[pathAsString]) {
            return [];
        }
        const annotations = storyControllers[pathAsString].exceptions.map(exception => ({
            row: exception.line - 1,
            type: exception.type,
            text: exception.message,
        }));
        if (editors[pathAsString]) {
            editors[pathAsString].getSession().setAnnotations(annotations);
        }
        return annotations;
    };

    function handleLoadEditor(editor, path) {
        setEditors({
            ...editors,
            [path]: editor,
        });
    }

    const renderAceEditor = (path) => {
        const pathAsString = path.join();
        return (
            <AceEditor
                readOnly={disabled}
                theme='github'
                width='100%'
                name='story'
                mode='text'
                onLoad={editor => handleLoadEditor(editor, pathAsString)}
                minLines={5}
                maxLines={Infinity}
                fontSize={14}
                onChange={newStory => storyControllers[pathAsString].setMd(newStory)}
                // noClean means it won't remove unused responses
                onBlur={() => storyControllers[pathAsString].saveUpdate({ noClean: true })}
                value={
                    storyControllers[pathAsString]
                        ? storyControllers[pathAsString].md
                        : ''
                }
                showPrintMargin={false}
                showGutter
                annotations={convertToAnnotations(pathAsString)}
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

    const renderVisualEditor = (path) => {
        if (!storyControllers[path.join()]) {
            return null;
        }
        return (
            <StoryErrorBoundary>
                <StoryVisualEditor story={storyControllers[path.join()]} getResponseLocations={getResponseLocations} reloadStories={reloadStories} />
            </StoryErrorBoundary>
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

    const handleSwitchBranch = (path, initContent) => {
        const pathAsString = path.join();
        // will instantiate a storyController if it doesn't exist
        if (
            !storyControllers[pathAsString]
            || !(storyControllers[pathAsString] instanceof StoryController)
        ) {
            const storyContent = typeof initContent === 'string'
                ? initContent
                : traverseStory(story, path).story;
            setStoryControllers({
                ...storyControllers,
                [pathAsString]: new StoryController({
                    story: storyContent || '',
                    slots,
                    onUpdate: (content, options) => saveStory(path, { story: content }, options),
                    onMdType: setLastMdType,
                    isABranch: path.length > 1,
                }),
            });
        }
        changeStoryPath(story._id, path);
    };

    const handleDeleteBranch = (path, branches, index) => {
        const parentPath = path.slice(0, path.length - 1);
        if (branches.length < 3) {
            // we append the remaining story to the parent one.
            const deletedStory = branches[!index ? 1 : 0];
            const newParentStory = `${storyControllers[parentPath.join()].md}${
                deletedStory.story ? '\n' : ''
            }${deletedStory.story || ''}`;
            saveStory(parentPath, {
                branches: deletedStory.branches,
                story: newParentStory,
            }, {
                callback: (err) => {
                    if (!err) handleSwitchBranch(parentPath);
                },
            });
            storyControllers[parentPath.join()].setMd(newParentStory);
        } else {
            const updatedBranches = [
                ...branches.slice(0, index),
                ...branches.slice(index + 1),
            ];
            saveStory(parentPath, { branches: updatedBranches }, {
                callback: (err) => {
                    if (!err) {
                        const adjacentBranch = index === 0
                            ? [...parentPath, branches[index + 1]._id]
                            : [...parentPath, branches[index - 1]._id];
                        handleSwitchBranch(adjacentBranch);
                    }
                },
            });
        }
    };

    useEffect(() => {
        const newExceptions = accumulateExceptions(
            story,
            slots,
            storyControllers,
            setStoryControllers,
            saveStory,
            setLastMdType,
        );
        setExceptions(newExceptions);
    }, [story, lastMdType, slots]);

    // new Level is true if the new branches create a new depth level of branches.
    const handleCreateBranch = (path, branches = [], num = 1, newLevel = true) => {
        const newBranches = [...new Array(num)].map((_, i) => ({
            title: getNewBranchName(branches, i),
            branches: [],
            _id: shortid.generate().replace('_', '0'),
        }));
        saveStory(path, { branches: [...branches, ...newBranches] }, {
            callback: (err) => {
                if (!err) {
                    setTimeout(() => handleSwitchBranch(
                        newLevel
                            ? [...branchPath, newBranches[0]._id]
                            : [...path, newBranches[0]._id],
                        '', // this is the initial content of the story
                    ), 200);
                }
            },
        });
    };

    const renderBranches = (depth = 0) => {
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
                {storyMode !== 'visual' || isLegacy
                    ? renderAceEditor(pathToRender)
                    : renderVisualEditor(pathToRender)}
                {branches.length > 0 && (
                    <Menu pointing secondary data-cy='branch-menu'>
                        {branches.map((branch, index) => {
                            const childPath = [...pathToRender, branch._id];
                            const branchLabelExceptions = exceptions[childPath.join()];
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
                                    onChangeName={newName => saveStory(childPath, { title: newName })}
                                    onDelete={() => handleDeleteBranch(childPath, branches, index)}
                                    exceptions={branchLabelExceptions}
                                    siblings={branches}
                                    isLinked={isBranchLinked(branch._id)}
                                    isParentLinked={isBranchLinked(pathToRender[pathToRender.length - 1])}
                                />
                            );
                        })}
                        <Menu.Item
                            key={`${pathToRender.join()}-add`}
                            className='add-tab'
                            onClick={() => handleCreateBranch(pathToRender, branches, 1, false)}
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
                    onDestinationStorySelection={onDestinationStorySelection}
                    destinationStory={destinationStory}
                    // We just check if there are any branches at the current path
                    // If there are, we can't branch
                    canBranch={canBranch()}
                    storyPath={getStoryPath()}
                    currentStoryId={story._id}
                    disableContinue
                />
            )}
        </div>
    );
};

StoryEditorContainer.propTypes = {
    story: PropTypes.object,
    disabled: PropTypes.bool,
    storyMode: PropTypes.string,
    branchPath: PropTypes.array,
    changeStoryPath: PropTypes.func.isRequired,
    collapsed: PropTypes.bool.isRequired,
    projectId: PropTypes.string,
};

StoryEditorContainer.defaultProps = {
    disabled: false,
    story: '',
    storyMode: 'markdown',
    branchPath: null,
    projectId: '',
};

const mapStateToProps = (state, ownProps) => ({
    branchPath: state.stories
        .getIn(
            ['savedStoryPaths', ownProps.story._id],
            IList(getDefaultPath(ownProps.story)),
        )
        .toJS(),
    collapsed: state.stories.getIn(['storiesCollapsed', ownProps.story._id], false),
    storyMode: state.stories.get('storyMode'),
    projectId: state.settings.get('projectId'),
});

const mapDispatchToProps = {
    changeStoryPath: setStoryPath,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(StoryEditorContainer);
