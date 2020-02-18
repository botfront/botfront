import { Container, Button } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import React, {
    useContext, useState, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Loading } from '../utils/Utils';

import { Stories } from '../../../api/story/stories.collection';
import { wrapMeteorCallback } from '../utils/Errors';
import StoryEditorContainer from './StoryEditorContainer';
import { setStoriesCollapsed } from '../../store/actions/actions';
import { ProjectContext } from '../../layouts/context';

function StoryEditors(props) {
    const {
        stories,
        onDeleteGroup,
        projectId,
        storyGroups,
        storyGroup,
        collapseAllStories,
        responsesInFetchedStories,
    } = props;

    const { addResponses } = useContext(ProjectContext);
    const [lastUpdate, setLastUpdate] = useState(0);

    const lastDate = useMemo(() => Date.now(), [responsesInFetchedStories]);

    useEffect(() => {
        if (responsesInFetchedStories.length) {
            addResponses(responsesInFetchedStories, lastDate)
                .then((res) => {
                    if (res) setLastUpdate(res);
                });
        } else setLastUpdate(lastDate);
    }, [responsesInFetchedStories]);

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

    const handleCollapseAllStories = (collapsed) => {
        const storiesCollapsed = {};
        stories.forEach(({ _id }) => { storiesCollapsed[_id] = collapsed; });
        collapseAllStories(storiesCollapsed);
    };

    const editors = stories.map((story, index) => (
        <StoryEditorContainer
            story={story}
            disabled={false}
            onRename={newTitle => handleStoryRenaming(newTitle, index)}
            onDelete={() => handleStoryDeletion(index)}
            key={story._id}
            title={story.title}
            groupNames={groupNames}
            onMove={newGroupId => handleMoveStory(newGroupId, index)}
            onClone={() => handleDuplicateStory(index)}
            collapseAllStories={handleCollapseAllStories}
        />
    ));

    return (
        <Loading loading={lastUpdate < lastDate}>
            {editors}
            <Container textAlign='center'>
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
            </Container>
        </Loading>
    );
}

StoryEditors.propTypes = {
    storyGroup: PropTypes.object.isRequired,
    storyGroups: PropTypes.array.isRequired,
    stories: PropTypes.array,
    projectId: PropTypes.string.isRequired,
    onDeleteGroup: PropTypes.func.isRequired,
    collapseAllStories: PropTypes.func.isRequired,
    responsesInFetchedStories: PropTypes.array,
};

StoryEditors.defaultProps = {
    stories: [],
    responsesInFetchedStories: [],
};

const StoryEditorsTracker = withTracker((props) => {
    const { projectId, storyGroup } = props;
    // We're using a specific subscription so we don't fetch too much at once
    const storiesHandler = Meteor.subscribe('stories.inGroup', projectId, storyGroup._id);
    const stories = Stories.find({
        projectId,
        storyGroupId: storyGroup._id,
    }).fetch();

    const responsesInFetchedStories = stories.reduce((acc, curr) => [...acc, ...((curr.events || []).filter(
        event => event.match(/^utter_/) && !acc.includes(event),
    ))], []);

    return {
        ready: storiesHandler.ready(),
        stories,
        responsesInFetchedStories,
    };
})(StoryEditors);

const mapStateToProps = () => ({
});

const mapDispatchToProps = {
    collapseAllStories: setStoriesCollapsed,
};

export default connect(mapStateToProps, mapDispatchToProps)(StoryEditorsTracker);
