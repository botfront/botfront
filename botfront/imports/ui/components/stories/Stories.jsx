import { Modal } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import React, {
    useState, useContext, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import SplitPane from 'react-split-pane';
import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import { Stories as StoriesCollection } from '../../../api/story/stories.collection';
import { ProjectContext } from '../../layouts/context';
import { ConversationOptionsContext } from './Context';
import StoryGroupNavigation from './StoryGroupNavigation';
import StoryGroupTree from './StoryGroupTree';
import { wrapMeteorCallback } from '../utils/Errors';
import StoryEditors from './StoryEditors';
import { Loading } from '../utils/Utils';

const SlotsEditor = React.lazy(() => import('./Slots'));
const PoliciesEditor = React.lazy(() => import('../settings/CorePolicy'));

const isStoryDeletable = (story, storyList, tree) => {
    const isDestination = s => (s.checkpoints || []).length;
    const isOrigin = s1 => storyList.some(s2 => (s2.checkpoints || []).some(c => c[0] === s1.id));
    const isDestinationOrOrigin = s => isDestination(s) || isOrigin(s);
    if (!story) return [false, null];
    const deletable = !story.canBearChildren
        ? !isDestinationOrOrigin(story)
        : !(story.children || []).some(c => isDestinationOrOrigin(tree.items[c]));
    const message = deletable
        ? story.canBearChildren
            ? `The story group ${story.title
            } and all its stories in it will be deleted. This action cannot be undone.`
            : `The story ${story.title
            } will be deleted. This action cannot be undone.`
        : story.canBearChildren
            ? `The story group ${story.title
            } cannot be deleted as it contains links.`
            : `The story ${story.title
            } cannot be deleted as it is linked to another story.`;
    return [deletable, message];
};

function Stories(props) {
    const {
        projectId,
        storyGroups,
        stories,
        ready,
    } = props;

    const { slots } = useContext(ProjectContext);

    const [slotsModal, setSlotsModal] = useState(false);
    const [policiesModal, setPoliciesModal] = useState(false);
    const [resizing, setResizing] = useState(false);
    const [activeStories, setActiveStories] = useState([]);

    const closeModals = () => {
        setSlotsModal(false);
        setPoliciesModal(false);
    };

    const modalWrapper = (open, title, content, scrolling = true) => (
        <Modal open={open} onClose={closeModals}>
            <Modal.Header>{title}</Modal.Header>
            <Modal.Content scrolling={scrolling}>
                <React.Suspense fallback={null}>{content}</React.Suspense>
            </Modal.Content>
        </Modal>
    );

    const reshapeStories = () => stories
        .map(story => ({ ...story, text: story.title, value: story._id }))
        .sort((storyA, storyB) => {
            if (storyA.text < storyB.text) return -1;
            if (storyA.text > storyB.text) return 1;
            return 0;
        });

    const storiesReshaped = useMemo(reshapeStories, [stories]);

    const handleAddStoryGroup = async title => Meteor.call('storyGroups.insert', { title, projectId }, wrapMeteorCallback);

    const handleDeleteGroup = storyGroup => Meteor.call('storyGroups.delete', storyGroup);

    const handleNewStory = (parentId, title) => Meteor.call(
        'stories.insert', {
            story: '', title, projectId, parentId, branches: [],
        },
        wrapMeteorCallback(),
    );

    const handleStoryDeletion = story => Meteor.call('stories.delete', story, projectId, wrapMeteorCallback);

    const handleStoryUpdate = story => Meteor.call('stories.update', story, projectId, wrapMeteorCallback);

    const handleNameChange = storyGroup => Meteor.call('storyGroups.update', storyGroup, wrapMeteorCallback);

    return (
        <Loading loading={!ready}>
            <ConversationOptionsContext.Provider
                value={{
                    browseToSlots: () => setSlotsModal(true),
                    stories: storiesReshaped,
                    storyGroups,
                    addGroup: handleAddStoryGroup,
                    deleteGroup: handleDeleteGroup,
                    updateGroup: handleNameChange,
                    addStory: handleNewStory,
                    deleteStory: handleStoryDeletion,
                    updateStory: handleStoryUpdate,
                }}
            >
                {modalWrapper(
                    slotsModal,
                    'Slots',
                    <SlotsEditor slots={slots} projectId={projectId} />,
                )}
                {modalWrapper(policiesModal, 'Policies', <PoliciesEditor />, false)}
                <SplitPane
                    split='vertical'
                    minSize={200}
                    defaultSize={300}
                    maxSize={400}
                    primary='first'
                    allowResize
                    className={resizing ? '' : 'width-transition'}
                    onDragStarted={() => setResizing(true)}
                    onDragFinished={() => setResizing(false)}
                >
                    <div>
                        <StoryGroupNavigation
                            allowAddition
                            onAdd={handleAddStoryGroup}
                            changeName={handleNameChange}
                            placeholderAddItem='Choose a group name'
                            modals={{ setSlotsModal, setPoliciesModal }}
                        />
                        <StoryGroupTree
                            storyGroups={storyGroups}
                            stories={stories}
                            onChangeActiveStories={setActiveStories}
                            activeStories={activeStories}
                            isStoryDeletable={isStoryDeletable}
                        />
                    </div>
                    <StoryEditors
                        projectId={projectId}
                        selectedIds={activeStories.map(({ id }) => id)}
                    />
                </SplitPane>
            </ConversationOptionsContext.Provider>
        </Loading>
    );
}

Stories.propTypes = {
    projectId: PropTypes.string.isRequired,
    ready: PropTypes.bool.isRequired,
    storyGroups: PropTypes.array.isRequired,
    stories: PropTypes.array.isRequired,
};

Stories.defaultProps = {
};

const StoriesWithTracker = withTracker((props) => {
    const { projectId } = props;
    const storiesHandler = Meteor.subscribe('stories.light', projectId);
    const storyGroupsHandler = Meteor.subscribe('storiesGroup', projectId);

    const storyGroups = StoryGroups.find().fetch();
    const stories = StoriesCollection.find().fetch();

    return {
        ready:
            storyGroupsHandler.ready()
            && storiesHandler.ready(),
        storyGroups,
        stories,
    };
})(Stories);

export default StoriesWithTracker;
