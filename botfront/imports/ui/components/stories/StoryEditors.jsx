import { Container, Button, Message } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import React, {
    useContext, useState, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Loading } from '../utils/Utils';

import { can } from '../../../lib/scopes';
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
        workingLanguage,
    } = props;

    const { addResponses } = useContext(ProjectContext);
    const [lastUpdate, setLastUpdate] = useState(0);

    const lastDate = useMemo(() => Date.now(), [stories.length, workingLanguage]);

    useEffect(() => {
        const responsesInFetchedStories = stories.reduce((acc, curr) => [...acc, ...((curr.events || []).filter(
            event => event.match(/^utter_/) && !acc.includes(event),
        ))], []);
        if (responsesInFetchedStories.length) {
            addResponses(responsesInFetchedStories)
                .then((res) => {
                    if (res) setLastUpdate(res);
                    else setLastUpdate(lastDate);
                });
        } else setLastUpdate(lastDate);
    }, [stories.length, workingLanguage]);

    const groupNames = storyGroups
        .filter(({ query }) => !query)
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
            disabled={!can('stories:w', projectId)}
            onRename={newTitle => handleStoryRenaming(newTitle, index)}
            onDelete={() => handleStoryDeletion(index)}
            key={story._id}
            title={story.title}
            groupNames={groupNames}
            onMove={newGroupId => handleMoveStory(newGroupId, index)}
            onClone={() => handleDuplicateStory(index)}
            isInSmartStories={!!storyGroup.query}
            collapseAllStories={handleCollapseAllStories}
        />
    ));

    return (
        <Loading loading={lastUpdate < lastDate}>
            {storyGroup.query && stories.length === 0 && (
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
    workingLanguage: PropTypes.string.isRequired,
};

StoryEditors.defaultProps = {
    stories: [],
};

const StoryEditorsTracker = withTracker((props) => {
    const { projectId, storyGroup } = props;
    // We're using a specific subscription so we don't fetch too much at once
    let storiesHandler = { ready: () => (false) };
    let stories = [];
    if (storyGroup.query) {
        storiesHandler = Meteor.subscribe('smartStories', projectId, storyGroup.query);
        stories = Stories.find({
            projectId,
            ...storyGroup.query,
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

const mapStateToProps = state => ({
    workingLanguage: state.settings.get('workingLanguage'),
});

const mapDispatchToProps = {
    collapseAllStories: setStoriesCollapsed,
};

export default connect(mapStateToProps, mapDispatchToProps)(StoryEditorsTracker);
