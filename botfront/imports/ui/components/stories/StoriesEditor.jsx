import { Container, Button } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import PropTypes from 'prop-types';

import { Stories } from '../../../api/story/stories.collection';
import { wrapMeteorCallback } from '../utils/Errors';
import StoryEditorContainer from './StoryEditorContainer';

function StoriesEditor(props) {
    const {
        stories,
        disabled,
        onAddNewStory,
        onDeleteGroup,
        storyGroup,
        groupNames,
        editor,
        onSaving,
        onSaved,
    } = props;

    function handleStoryDeletion(index) {
        Meteor.call(
            'stories.delete',
            stories[index],
            wrapMeteorCallback((err) => {
                if (!err) {
                    if (stories.length === 1) onDeleteGroup();
                }
            }),
        );
    }

    function handleStoryRenaming(newTitle, index) {
        Meteor.call('stories.update', { ...stories[index], title: newTitle });
    }

    function handleMoveStory(newGroupId, index) {
        if (newGroupId === stories[index].storyGroupId) {
            return;
        }
        Meteor.call(
            'stories.update',
            { ...stories[index], storyGroupId: newGroupId },
            wrapMeteorCallback((err) => {
                if (!err) {
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
        delete newStory.checkpoints;
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
        <StoryEditorContainer
            story={story}
            disabled={disabled}
            onRename={newTitle => handleStoryRenaming(newTitle, index)}
            onDelete={() => handleStoryDeletion(index)}
            key={story._id}
            title={story.title}
            groupNames={groupNames.filter(name => name.text !== storyGroup.name)}
            onMove={newGroupId => handleMoveStory(newGroupId, index)}
            onClone={() => handleDuplicateStory(index)}
            editor={editor}
            onSaving={onSaving}
            onSaved={onSaved}
        />
    ));

    return (
        <>
            {editors}
            <Container textAlign='center'>
                <Button icon='add' basic name='add' onClick={() => onAddNewStory(stories.length + 1)} size='medium' data-cy='add-story' color='black' content='Add a story' />
            </Container>
        </>
    );
}

StoriesEditor.propTypes = {
    storyGroup: PropTypes.object.isRequired,
    stories: PropTypes.array,
    onSaving: PropTypes.func.isRequired, // this method will be called when the component starts saving changes
    onSaved: PropTypes.func.isRequired, // This one is called when changes are saved
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
    editor: 'markdown',
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
