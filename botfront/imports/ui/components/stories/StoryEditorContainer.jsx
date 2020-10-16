import React, {
    useState,
    useContext,
    useEffect,
    useMemo,
    useCallback,
    useRef,
} from 'react';
import { Icon, Segment, Menu } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import { debounce } from 'lodash';
import { List as IList } from 'immutable';
import { safeLoad, safeDump } from 'js-yaml';
import shortid from 'shortid';
import 'brace/theme/kuroir';
import 'brace/theme/github';
import 'brace/mode/text';
import 'brace/mode/yaml';

import { traverseStory } from '../../../lib/story.utils';
import { DialogueFragmentValidator } from '../../../lib/dialogue_fragment_validator';
import { ConversationOptionsContext } from './Context';
import { ProjectContext } from '../../layouts/context';
import { setStoryPath } from '../../store/actions/actions';
import StoryVisualEditor from './common/StoryVisualEditor';
import StoryErrorBoundary from './StoryErrorBoundary';
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

const stepsToYaml = steps => safeDump(steps || [])
    .replace(/^\[\]/, '')
    .replace(/\n$/, '');

const StoryEditorContainer = ({
    story,
    disabled,
    storyMode,
    branchPath,
    changeStoryPath,
    collapsed,
}) => {
    const {
        stories, getResponseLocations, updateStory,
    } = useContext(
        ConversationOptionsContext,
    );
    const { slots } = useContext(ProjectContext);
    const isLegacy = 'story' in story; // legacy (Md) stories use the Ace Editor

    const editors = useRef({});
    const [annotations, setAnnotations] = useState({});
    const [destinationStory, setDestinationStory] = useState(null);
    const [destinationStories, setDestinationStories] = useState([]);

    const reducer = (input, priorPath = '') => input.reduce((acc, { _id, branches = [], ...rest }) => {
        const path = priorPath ? `${priorPath},${_id}` : _id;
        return { ...acc, [path]: { ...rest, branches }, ...reducer(branches, path) };
    }, {});
    const branches = useMemo(() => reducer([story]), [JSON.stringify(story)]);

    const validateYaml = (update) => {
        const newAnnotations = Object.keys(update).reduce((acc, curr) => ({ ...acc, [curr]: new DialogueFragmentValidator().validateYamlFragment(update[curr]) }), {});
        setAnnotations(prev => ({ ...prev, ...newAnnotations }));
        Object.keys(newAnnotations).forEach((path) => {
            const editor = editors.current[path];
            if (editor) {
                if (newAnnotations[path].length) editor.getSession().setAnnotations(newAnnotations[path]);
                else editor.getSession().clearAnnotations();
            }
        });
    };

    const [editorYaml, doSetEditorYaml] = useState({});

    const setEditorYaml = (update) => {
        doSetEditorYaml(prev => ({ ...prev, ...update }));
        validateYaml(update);
    };
    useEffect(() => {
        if (isLegacy) return;
        setEditorYaml(
            Object.keys(branches).reduce(
                (acc, curr) => ({
                    ...acc,
                    [curr]: stepsToYaml(branches[curr].steps),
                }),
                {},
            ),
        );
    }, [storyMode]);

    const saveStory = (path, content, { callback } = {}) => updateStory(
        { _id: story._id, ...content, path },
        () => {
            if (!isLegacy && Array.isArray(content.steps)) {
                setEditorYaml({ [path.join()]: stepsToYaml(content.steps) });
            }
            if (typeof callback === 'function') callback();
        },
    );
    const saveStoryDebounced = useCallback(debounce(saveStory, 500), []);

    const isBranchLinked = branchId => destinationStories
        .some(aStory => (aStory.checkpoints || [])
            .some(checkpointPath => checkpointPath.includes(branchId)));

    useEffect(() => {
        const newDestinationStories = stories.filter(aStory => branchPath
            .some(storyId => (aStory.checkpoints || [])
                .some(checkpointPath => checkpointPath.includes(storyId))));
        const newDestinationStory = newDestinationStories.find(aStory => (aStory.checkpoints || []).some(
            checkpoint => checkpoint[checkpoint.length - 1]
                    === branchPath[branchPath.length - 1],
        ));
        setDestinationStories(newDestinationStories);
        setDestinationStory(newDestinationStory);
    }, [branchPath, stories]);

    function onDestinationStorySelection(event, { value }) {
        if (value === '') {
            Meteor.call('stories.removeCheckpoints', destinationStory._id, branchPath);
        } else if (value && destinationStory) {
            Meteor.call(
                'stories.removeCheckpoints',
                destinationStory._id,
                branchPath,
                () => Meteor.call('stories.addCheckpoints', value, branchPath),
            );
        } else {
            Meteor.call('stories.addCheckpoints', value, branchPath);
        }
    }

    const exceptions = useMemo(() => Object.keys(branches).sort((a, b) => (a.match(/,/g) || []).length < (b.match(/,/g) || []).length).reduce((acc, curr) => ({
        ...acc,
        [curr]: [
            ...(annotations[curr] || []),
            ...((branches[curr].branches || []).reduce((acc2, { _id }) => acc2.concat(acc[`${curr},${_id}`] || []), [])),
        ],
    }), {}), [annotations]);

    const renderTopMenu = () => (
        <StoryTopMenu
            title={story.title}
            storyId={story._id}
            disabled={disabled}
            errors={exceptions[story._id].filter(({ type }) => type === 'error').length}
            warnings={exceptions[story._id].filter(({ type }) => type === 'warning').length}
            isDestinationStory={story.checkpoints && story.checkpoints.length > 0}
            originStories={story.checkpoints}
            initPayload={story.steps?.[0]?.intent}
        />
    );

    const saveWithAce = (path) => {
        if (!annotations[path.join()]?.some(({ type }) => type === 'error')) {
            saveStoryDebounced(path, { steps: safeLoad(editorYaml[path.join()] || '') });
        }
    };

    const renderAceEditor = path => (
        <AceEditor
            key={path.join()}
            readOnly={disabled}
            theme={isLegacy ? 'kuroir' : 'github'}
            width='100%'
            name='story'
            mode={isLegacy ? 'text' : 'yaml'}
            minLines={5}
            maxLines={Infinity}
            fontSize={14}
            onLoad={
                isLegacy
                    ? undefined
                    : (instance) => {
                        editors.current = {
                            ...editors.current,
                            [path.join()]: instance,
                        };
                        validateYaml({ [path.join()]: editorYaml[path.join()] });
                    }
            }
            onChange={
                isLegacy
                    ? input => saveStoryDebounced(path, { story: input })
                    : input => setEditorYaml({ [path.join()]: input })
            }
            onBlur={isLegacy ? undefined : () => saveWithAce(path)}
            value={
                isLegacy ? branches[path.join()]?.story || '' : editorYaml[path.join()]
            }
            showPrintMargin={false}
            showGutter
            editorProps={{
                $blockScrolling: Infinity,
            }}
            setOptions={{
                tabSize: 2,
                useWorker: false, // the worker has a bug which removes annotations
            }}
        />
    );

    const renderVisualEditor = (path) => {
        if (!branches[path.join()]) {
            return null;
        }
        return (
            <StoryErrorBoundary>
                <StoryVisualEditor
                    onSave={steps => saveStory(path, { steps })}
                    story={branches[path.join()]?.steps || []}
                    getResponseLocations={getResponseLocations}
                />
            </StoryErrorBoundary>
        );
    };

    const getNewBranchName = (inputBranches, offset = 0) => {
        const branchNums = inputBranches.map((branch) => {
            if (branch.title.match(/New Branch (\d+)$/)) {
                return parseInt(branch.title.match(/New Branch (\d+)$/)[1], 10);
            }
            return 0;
        });
        const newBranchNum = Math.max(0, ...branchNums) + offset;
        return `New Branch ${newBranchNum + 1}`;
    };

    const handleCreateBranch = (path, newLevel = true) => {
        const num = newLevel ? 2 : 1;
        const { branches: currentBranches = [] } = branches[path.join()];
        const newBranches = [...new Array(num)].map((_, i) => ({
            title: getNewBranchName(currentBranches, i),
            steps: [],
            branches: [],
            _id: shortid.generate().replace('_', '0'),
        }));
        saveStory(
            path,
            { branches: [...currentBranches, ...newBranches] },
            {
                callback: (err) => {
                    if (!err) {
                        setTimeout(
                            () => changeStoryPath(
                                story._id,
                                newLevel
                                    ? [...branchPath, newBranches[0]._id]
                                    : [...path, newBranches[0]._id],
                            ),
                            200,
                        );
                    }
                },
            },
        );
    };

    const handleDeleteBranch = (path, index) => {
        const parentPath = path.slice(0, path.length - 1);
        const parentStory = branches[parentPath.join()];
        const { branches: currentBranches = [] } = parentStory;
        if (currentBranches.length < 3) {
            // we append the remaining story to the parent one.
            const deletedStory = currentBranches[!index ? 1 : 0];
            const newParentStory = `${parentStory.story || ''}${
                deletedStory.story ? '\n' : ''
            }${deletedStory.story || ''}`;
            const newParentSteps = [
                ...(parentStory.steps || []),
                ...(deletedStory.steps || []),
            ];
            const update = isLegacy
                ? { story: newParentStory }
                : { steps: newParentSteps };
            saveStory(
                parentPath,
                {
                    branches: deletedStory.branches,
                    ...update,
                },
                {
                    callback: (err) => {
                        if (!err) changeStoryPath(story._id, parentPath);
                    },
                },
            );
            return;
        }
        const updatedBranches = [
            ...currentBranches.slice(0, index),
            ...currentBranches.slice(index + 1),
        ];
        saveStory(
            parentPath,
            { branches: updatedBranches },
            {
                callback: (err) => {
                    if (!err) {
                        const adjacentBranch = index === 0
                            ? [...parentPath, currentBranches[index + 1]._id]
                            : [...parentPath, currentBranches[index - 1]._id];
                        changeStoryPath(story._id, adjacentBranch);
                    }
                },
            },
        );
    };

    const renderBranches = (depth = 0) => {
        const pathToRender = branchPath.slice(0, depth + 1);
        const localBranches = branches[pathToRender.join()].branches;
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
                {localBranches.length > 0 && (
                    <Menu pointing secondary data-cy='branch-menu'>
                        {localBranches.map((branch, index) => {
                            const childPath = [...pathToRender, branch._id];
                            return (
                                <BranchTabLabel
                                    key={childPath.join()}
                                    value={branch.title}
                                    active={branchPath.indexOf(branch._id) !== -1}
                                    onSelect={() => {
                                        // do no change activeBranch if clicked branch is already in the path
                                        if (branchPath.indexOf(branch._id) !== -1) return;
                                        changeStoryPath(story._id, childPath);
                                    }}
                                    onChangeName={newName => saveStory(childPath, { title: newName })}
                                    onDelete={() => handleDeleteBranch(childPath, index)}
                                    errors={exceptions[childPath.join()]?.filter(({ type }) => type === 'error').length}
                                    warnings={exceptions[childPath.join()]?.filter(({ type }) => type === 'warning').length}
                                    siblings={localBranches}
                                    isLinked={isBranchLinked(branch._id)}
                                    isParentLinked={isBranchLinked(
                                        pathToRender[pathToRender.length - 1],
                                    )}
                                />
                            );
                        })}
                        <Menu.Item
                            key={`${pathToRender.join()}-add`}
                            className='add-tab'
                            onClick={() => handleCreateBranch(pathToRender, false)}
                            data-cy='add-branch'
                        >
                            <Icon name='plus' />
                        </Menu.Item>
                    </Menu>
                )}
                {localBranches.length > 0
                    && branchPath.length > pathToRender.length // render branch content
                    && renderBranches(depth + 1)}
            </Segment>
        );
    };

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
                    onBranch={() => handleCreateBranch(branchPath)}
                    onContinue={() => {}}
                    canContinue={false}
                    onDestinationStorySelection={onDestinationStorySelection}
                    destinationStory={destinationStory}
                    canBranch={!branches[branchPath.join()]?.branches.length}
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
};

StoryEditorContainer.defaultProps = {
    disabled: false,
    story: '',
    storyMode: 'yaml',
    branchPath: null,
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
});

const mapDispatchToProps = {
    changeStoryPath: setStoryPath,
};

export default connect(mapStateToProps, mapDispatchToProps)(StoryEditorContainer);
