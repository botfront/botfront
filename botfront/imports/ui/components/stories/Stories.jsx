import { Message, Modal } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import React, {
    useState, useEffect, useContext, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SplitPane from 'react-split-pane';
import { setStoryGroup, setStoryMode } from '../../store/actions/actions';
import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import { Stories as StoriesCollection } from '../../../api/story/stories.collection';
import { ProjectContext } from '../../layouts/context';
import { ConversationOptionsContext } from './Context';
import StoryGroupBrowser from './StoryGroupBrowser';
import StoryGroupTree from './StoryGroupTree';
import { wrapMeteorCallback } from '../utils/Errors';
import StoryEditors from './StoryEditors';

const SlotsEditor = React.lazy(() => import('./Slots'));
const PoliciesEditor = React.lazy(() => import('../settings/CorePolicy'));

function Stories(props) {
    const {
        projectId,
        storyGroups,
        stories,
        storyGroupCurrent,
        storyMode,
        changeStoryGroup,
        changeStoryMode,
        ready,
    } = props;

    const { slots } = useContext(ProjectContext);

    const [switchToGroupByIdNext, setSwitchToGroupByIdNext] = useState('');
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

    const switchToGroupById = groupId => changeStoryGroup(storyGroups.findIndex(sg => sg._id === groupId));

    const reshapeStories = () => stories
        .map(story => ({ ...story, text: story.title, value: story._id }))
        .sort((storyA, storyB) => {
            if (storyA.text < storyB.text) return -1;
            if (storyA.text > storyB.text) return 1;
            return 0;
        });

    const storiesReshaped = useMemo(reshapeStories, [stories]);

    useEffect(() => {
        if (switchToGroupByIdNext) {
            switchToGroupById(switchToGroupByIdNext);
            setSwitchToGroupByIdNext('');
        }
    }, [switchToGroupByIdNext]);

    const handleAddStoryGroup = async (name) => {
        Meteor.call(
            'storyGroups.insert',
            { name, projectId },
            wrapMeteorCallback((err, groupId) => {
                if (!err) {
                    Meteor.call(
                        'stories.insert',
                        {
                            story: '',
                            title: name,
                            storyGroupId: groupId,
                            projectId,
                        },
                        wrapMeteorCallback((error) => {
                            if (!error) setSwitchToGroupByIdNext(groupId);
                        }),
                    );
                }
            }),
        );
    };

    const handleDeleteGroup = (storyGroup) => {
        if (!storyGroup.introStory) {
            Meteor.call('storyGroups.delete', storyGroup, () => {
                /* if the story group was the last story group, change the
                selected index to be the new last story group */
                const deletedStoryIndex = storyGroups.findIndex(({ _id }) => _id === storyGroup._id);
                if (storyGroupCurrent > deletedStoryIndex || storyGroupCurrent === storyGroups.length - 1) {
                    changeStoryGroup(storyGroupCurrent - 1);
                    return;
                }
                changeStoryGroup(storyGroupCurrent);
            });
        }
    };
    const handleStoryGroupSelect = storyGroup => Meteor.call('storyGroups.update', {
        ...storyGroup,
        selected: !storyGroup.selected,
    });
    const removeAllSelection = () => Meteor.call('storyGroups.removeFocus', projectId);

    const handleNameChange = (storyGroup) => {
        Meteor.call(
            'storyGroups.update',
            storyGroup,
            wrapMeteorCallback((err) => {
                if (!err) setSwitchToGroupByIdNext(storyGroup._id);
            }),
        );
    };

    const renderMessages = () => {
        const numberOfSelectedStoryGroups = storyGroups.filter(
            storyGroup => storyGroup.selected,
        ).length;
        const link = (
            <span
                id='remove-focus'
                tabIndex='0'
                onClick={removeAllSelection}
                onKeyDown={() => { }}
                role='button'
            >
                Remove focus
            </span>
        );
        const plural = numberOfSelectedStoryGroups > 1;
        return (
            numberOfSelectedStoryGroups >= 1 && (
                <Message warning>
                    You’re currently focusing on {numberOfSelectedStoryGroups} story group
                    {plural && 's'} and only {plural ? 'those' : 'that'} story group
                    {plural && 's'} will be trained. {link}
                </Message>
            )
        );
    };
    const renderStoriesContainer = () => (
        <ConversationOptionsContext.Provider
            value={{
                browseToSlots: () => setSlotsModal(true),
                stories: storiesReshaped,
                storyGroups,
                deleteStoryGroup: handleDeleteGroup,
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
                    {renderMessages()}
                    <StoryGroupBrowser
                        data={storyGroups}
                        allowAddition
                        allowEdit
                        index={storyGroupCurrent}
                        onAdd={handleAddStoryGroup}
                        onChange={changeStoryGroup}
                        onSwitchStoryMode={changeStoryMode}
                        storyMode={storyMode}
                        nameAccessor='title'
                        selectAccessor='selected'
                        toggleSelect={handleStoryGroupSelect}
                        changeName={handleNameChange}
                        placeholderAddItem='Choose a group name'
                        modals={{ setSlotsModal, setPoliciesModal }}
                    />
                    <StoryGroupTree
                        storyGroups={storyGroups}
                        stories={stories}
                        onChangeActiveStories={setActiveStories}
                        activeStories={activeStories}
                    />
                </div>
                <StoryEditors
                    onDeleteGroup={handleDeleteGroup}
                    projectId={projectId}
                    storyGroups={storyGroups}
                    storyGroup={storyGroups[storyGroupCurrent]}
                />
            </SplitPane>
        </ConversationOptionsContext.Provider>
    );

    if (ready) return renderStoriesContainer();
    return null;
}

Stories.propTypes = {
    projectId: PropTypes.string.isRequired,
    ready: PropTypes.bool.isRequired,
    storyGroups: PropTypes.array.isRequired,
    changeStoryGroup: PropTypes.func.isRequired,
    changeStoryMode: PropTypes.func.isRequired,
    storyGroupCurrent: PropTypes.number,
    storyMode: PropTypes.string,
};

Stories.defaultProps = {
    storyGroupCurrent: 0,
    storyMode: 'visual',
};

const StoriesWithTracker = withTracker((props) => {
    const { projectId, storyGroupCurrent, changeStoryGroup } = props;
    const storiesHandler = Meteor.subscribe('stories.light', projectId);
    const storyGroupsHandler = Meteor.subscribe('storiesGroup', projectId);

    // fetch and sort story groups
    const unsortedStoryGroups = StoryGroups.find({}, { sort: [['introStory', 'desc']] }).fetch();
    const sortedStoryGroups = unsortedStoryGroups // sorted on the frontend
        .slice(1)
        .sort((storyGroupA, storyGroupB) => {
            const nameA = storyGroupA.title.toUpperCase();
            const nameB = storyGroupB.title.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
    // unsortedStoryGroups[0] is the intro story group
    const storyGroups = [unsortedStoryGroups[0], ...sortedStoryGroups];

    let sgIndex = storyGroupCurrent;
    if (!storyGroups[sgIndex]) {
        if (storyGroups[sgIndex + 1]) sgIndex += 1;
        else if (storyGroups[sgIndex - 1]) sgIndex -= 1;
        else sgIndex = 0;
        changeStoryGroup(sgIndex);
    }

    return {
        ready:
            storyGroupsHandler.ready()
            && storiesHandler.ready(),
        storyGroups,
        stories: StoriesCollection.find().fetch(),
        storyGroupCurrent: sgIndex,
    };
})(Stories);

const mapStateToProps = state => ({
    storyGroupCurrent: state.stories.get('storyGroupCurrent'),
    storyMode: state.stories.get('storyMode'),
});

const mapDispatchToProps = {
    changeStoryGroup: setStoryGroup,
    changeStoryMode: setStoryMode,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(StoriesWithTracker);
