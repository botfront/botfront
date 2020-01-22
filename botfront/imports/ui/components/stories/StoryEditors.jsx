import { Container, Button, Message } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import PropTypes from 'prop-types';
import { safeLoad } from 'js-yaml';
import { can } from '../../../lib/scopes';

import { Stories } from '../../../api/story/stories.collection';
import { wrapMeteorCallback } from '../utils/Errors';
import StoryEditorContainer from './StoryEditorContainer';

function StoryEditors(props) {
    const {
        stories,
        onDeleteGroup,
        projectId,
        storyGroups,
        storyGroup,
    } = props;

    const groupNames = storyGroups
        .map(group => ({
            text: group.name,
            value: group._id,
        }))
        .filter(name => name.text !== storyGroup.name);

    const handleNewStory = (indexOfNewStory) => {
        Meteor.call(
            'stories.insert',
            {
                story: '',
                title: `${storyGroup.name} ${indexOfNewStory}`,
                projectId,
                storyGroupId: storyGroup._id,
                branches: [],
            },
            wrapMeteorCallback(),
        );
    };

    function handleStoryDeletion(index) {
        Meteor.call(
            'stories.delete',
            stories[index],
            projectId,
            wrapMeteorCallback((err) => {
                if (!err) {
                    if (stories.length === 1) onDeleteGroup(storyGroup);
                }
            }),
        );
    }

    function handleStoryRenaming(newTitle, index) {
        Meteor.call('stories.update', { ...stories[index], title: newTitle }, projectId);
    }

    function handleMoveStory(newGroupId, index) {
        if (newGroupId === stories[index].storyGroupId) {
            return;
        }
        Meteor.call(
            'stories.update',
            { ...stories[index], storyGroupId: newGroupId },
            projectId,
            wrapMeteorCallback((err) => {
                if (!err) {
                    // deletes group if no stories left
                    if (stories.length === 1) {
                        onDeleteGroup(storyGroup);
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
            disabled={!can('stories:w', projectId)}
            onRename={newTitle => handleStoryRenaming(newTitle, index)}
            onDelete={() => handleStoryDeletion(index)}
            key={story._id}
            title={story.title}
            groupNames={groupNames}
            onMove={newGroupId => handleMoveStory(newGroupId, index)}
            onClone={() => handleDuplicateStory(index)}
            onSaving={() => {}}
            onSaved={() => {}}
            isInSmartStories={!!storyGroup.query}
        />
    ));

    return (
        <>
            {storyGroup.isSmartGroup && stories.length === 0 && (
                <Message info icon={{ name: 'info circle', size: 'small' }} content='Stories with smart triggers will appear here' data-cy='smart-stories-message' />
            )}
            {editors}
            <Container textAlign='center'>
                {can('stories:w', projectId) && !storyGroup.query && (
                    <Button
                        icon='add'
                        basic
                        name='add'
                        onClick={() => handleNewStory(stories.length + 1)}
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

StoryEditors.propTypes = {
    storyGroup: PropTypes.object.isRequired,
    storyGroups: PropTypes.array.isRequired,
    stories: PropTypes.array,
    projectId: PropTypes.string.isRequired,
    onDeleteGroup: PropTypes.func.isRequired,
};

StoryEditors.defaultProps = {
    stories: [],
};

export default withTracker((props) => {
    const { projectId, storyGroup } = props;
    // We're using a specific subscription so we don't fetch too much at once
    let storiesHandler = { ready: () => (false) };
    let stories = [];
    // console.log(storyGroup);
    if (storyGroup.query) {
        storiesHandler = Meteor.subscribe('smartStories', projectId, storyGroup.query);
        stories = Stories.find({
            projectId,
            ...safeLoad(storyGroup.query),
        }).fetch();
    } else {
        storiesHandler = Meteor.subscribe('stories.inGroup', projectId, storyGroup._id);
        stories = Stories.find({
            projectId,
            storyGroupId: storyGroup._id,
        }).fetch();
    }
    return {
        ready: storiesHandler.ready(),
        stories,
    };
})(StoryEditors);
