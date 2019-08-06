import { Container, Button } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { can } from '../../../lib/scopes';

import { Stories } from '../../../api/story/stories.collection';
import { StoryController } from '../../../lib/story_controller';
import { ConversationOptionsContext } from '../utils/Context';
import { wrapMeteorCallback } from '../utils/Errors';
import StoryAceEditor from './StoryAceEditor';

function StoriesEditor(props) {
    const [errors, setErrors] = useState([]);
    // This state is only used to store edited stories
    const [editedStories, setEditedStories] = useState({});
    const { slots } = useContext(ConversationOptionsContext);

    const {
        stories,
        disabled,
        onSaving,
        onSaved,
        onError,
        onErrorResolved,
        onAddNewStory,
        onDeleteGroup,
        storyGroup,
        projectId,
        groupNames,
        editor,
    } = props;

    function saveStory(story) {
        onSaving();
        Meteor.call(
            'stories.update',
            story,
            wrapMeteorCallback(() => {
                onSaved();
            }),
        );
    }

    const updateEditedStories = () => {
        stories.forEach((story, index) => {
            if (editedStories[story._id] === undefined) {
                editedStories[story._id] = new StoryController(
                    story.story || '',
                    slots,
                    () => {
                        setEditedStories({
                            ...editedStories,
                            [story._id]: Object.assign(
                                Object.create(editedStories[story._id]),
                                editedStories[story._id],
                            ),
                        });
                    },
                    newContent => saveStory({ ...stories[index], story: newContent }),
                );
            }
        });
    };

    if (Object.keys(editedStories).length === 0) {
        updateEditedStories();
    }

    // This effect listen to changes on errors and notifies
    // the parent component if no errors were detected
    useEffect(() => {
        let noErrors = true;
        errors.forEach((error) => {
            if (error && error.length) {
                noErrors = false;
            }
        });
        if (noErrors) onErrorResolved();
    }, [errors]);

    // This effect resets the state if the storyGroup being displayed changed
    useEffect(() => {
        // console.log('use effect');
        setEditedStories({});
        setErrors([]);
    }, [storyGroup]);

    useEffect(() => {
        updateEditedStories();
    });

    function spliceStoryState(index) {
        const stateErrors = [...errors];
        stateErrors.splice(index, 1);
        setErrors(stateErrors);
    }

    function handleStoryChange(newStory, index) {
        // console.log('handle story change');
        if (!editedStories[stories[index]._id]) {
            editedStories[stories[index]._id] = new StoryController(
                newStory,
                slots,
                () => {
                    setEditedStories({
                        ...editedStories,
                        [stories[index]._id]: Object.assign(
                            Object.create(editedStories[stories[index]._id]),
                            editedStories[stories[index]._id],
                        ),
                    });
                },
                newContent => saveStory({ ...stories[index], story: newContent }),
            );
            return;
        }
        editedStories[stories[index]._id].setUnsafeMd(newStory);
        const newVal = new StoryController(newStory, slots);
        newVal.validateStory();

        const newErrors = [...errors];
        newErrors[index] = newVal.exceptions;
        setErrors(newErrors);

        if (newVal.exceptions.length) onError();
        else editedStories[stories[index]._id].setMd(newStory);
    }

    function handeStoryDeletion(index) {
        const toBeDeletedStory = stories[index];
        spliceStoryState(index);
        Meteor.call(
            'stories.delete',
            toBeDeletedStory,
            wrapMeteorCallback((err) => {
                if (!err) {
                    // delete entry in editedStories
                    const newEditedStories = editedStories;
                    delete newEditedStories[toBeDeletedStory._id];
                    setEditedStories(newEditedStories);
                    // deletes group if no stories left
                    if (stories.length === 1) {
                        onDeleteGroup();
                    }
                }
            }),
        );
    }

    function handleStoryRenaming(newTitle, index) {
        Meteor.call('stories.update', { ...stories[index], title: newTitle });
    }

    function handleMoveStory(newGroupId, index) {
        const toBeMovedStory = stories[index];
        if (newGroupId === stories[index].storyGroupId) {
            return;
        }
        spliceStoryState(index);
        Meteor.call(
            'stories.update',
            { ...stories[index], storyGroupId: newGroupId },
            wrapMeteorCallback((err) => {
                if (!err) {
                    // delete entry in editedStories
                    const newEditedStories = editedStories;
                    delete newEditedStories[toBeMovedStory._id];
                    setEditedStories(newEditedStories);
                    // deletes group if no stories left
                    if (stories.length === 1) {
                        onDeleteGroup();
                    }
                }
            }),
        );
    }

    function handleDuplicateStory(index) {
        const newStory = { ...stories[index] };
        delete newStory._id;
        newStory.title = `${stories[index].title} (copy)`;
        Meteor.call(
            'stories.insert',
            newStory,
            wrapMeteorCallback((err) => {
                if (!err) {
                    const editors = document.querySelectorAll('.story-editor');
                    editors
                        .item(editors.length - 1)
                        .scrollIntoView({ behavior: 'smooth' });
                }
            }),
        );
    }

    const editors = stories.map((story, index) => (
        <StoryAceEditor
            story={editedStories[story._id]}
            annotations={
                (!!errors[index] ? true : undefined)
                && (!!errors[index].length ? true : undefined)
                && errors[index].map(error => ({
                    row: error.line - 1,
                    type: error.type,
                    text: error.message,
                    column: 0,
                }))
            }
            disabled={disabled}
            onChange={data => handleStoryChange(data, index)}
            onRename={newTitle => handleStoryRenaming(newTitle, index)}
            onDelete={() => handeStoryDeletion(index)}
            key={index}
            title={story.title}
            groupNames={groupNames.filter(name => name.text !== storyGroup.name)}
            onMove={newGroupId => handleMoveStory(newGroupId, index)}
            onClone={() => handleDuplicateStory(index)}
            editor={editor}
        />
    ));
    return (
        <>
            {editors}
            <Container textAlign='center'>
                {can('stories:w', projectId) && (
                    <Button
                        icon='add'
                        basic
                        name='add'
                        onClick={() => onAddNewStory(stories.length + 1)}
                        size='medium'
                        data-cy='add-story'
                        color='black'
                        content='Add a story'
                    />
                )}
            </Container>
        </>
    );
}

StoriesEditor.propTypes = {
    storyGroup: PropTypes.object.isRequired,
    stories: PropTypes.array,
    // this method will be called when the component starts saving changes
    onSaving: PropTypes.func.isRequired,
    // This one is called when changes are saved
    onError: PropTypes.func.isRequired,
    onErrorResolved: PropTypes.func.isRequired,
    onSaved: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    onAddNewStory: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    onDeleteGroup: PropTypes.func.isRequired,
    groupNames: PropTypes.array.isRequired,
    editor: PropTypes.string,
};

StoriesEditor.defaultProps = {
    disabled: false,
    stories: [],
    editor: 'MARKDOWN',
};

export default withTracker((props) => {
    const { storyGroup, projectId } = props;
    // We're using a specific subscription so we don't fetch too much at once
    const storiesHandler = Meteor.subscribe('stories.inGroup', projectId, storyGroup._id);

    return {
        ready: storiesHandler.ready(),
        stories: Stories.find({
            projectId,
            storyGroupId: storyGroup._id,
        }).fetch(),
    };
})(StoriesEditor);
