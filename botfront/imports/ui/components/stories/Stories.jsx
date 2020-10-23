import { Modal, Container } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import React, {
    useState,
    useContext,
    useMemo,
    useCallback,
    useEffect,
    useRef,
} from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import SplitPane from 'react-split-pane';
import shortId from 'shortid';
import { setStoriesCurrent } from '../../store/actions/actions';
import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import { Stories as StoriesCollection } from '../../../api/story/stories.collection';
import { ProjectContext } from '../../layouts/context';
import { ConversationOptionsContext } from './Context';
import StoryGroupNavigation from './StoryGroupNavigation';
import StoryGroupTree from './StoryGroupTree';
import { wrapMeteorCallback } from '../utils/Errors';
import StoryEditors from './StoryEditors';
import { Loading } from '../utils/Utils';
import { useEventListener } from '../utils/hooks';
import { can } from '../../../lib/scopes';

const SlotsEditor = React.lazy(() => import('./Slots'));
const PoliciesEditor = React.lazy(() => import('../settings/CorePolicy'));

const isDeletionPossible = (node = {}, nodes, tree) => {
    const isDestination = s1 => ((nodes.find(s2 => s2._id === s1.id) || {}).checkpoints || []).length;
    const isOrigin = s1 => nodes.some(s2 => (s2.checkpoints || []).some(c => c[0] === s1.id));
    const isDestinationOrOrigin = s => isDestination(s) || isOrigin(s);
    let deletable = false;
    let message = null;
    if (['story', 'rule'].includes(node.type)) {
        deletable = !isDestinationOrOrigin(node);
        message = deletable
            ? `'${node.title}' will be deleted. This action cannot be undone.`
            : `'${node.title}' cannot be deleted as it is linked to another story.`;
    }
    if (node.type === 'story-group') {
        deletable = !(node.children || []).some(c => isDestinationOrOrigin(tree.items[c]));
        message = deletable
            ? `The group ${node.title} and all its content in it will be deleted. This action cannot be undone.`
            : `The group ${node.title} cannot be deleted as it contains links.`;
    }
    if (node.type === 'form') {
        deletable = true;
        message = `The form ${node.title} will be deleted. This action cannot be undone.`;
    }
    return [deletable, message];
};

function Stories(props) {
    const {
        projectId,
        storyGroups,
        stories,
        ready,
        router,
        storyMenuSelection,
        setStoryMenuSelection: doSetStoryMenuSelection,
    } = props;

    const { slots } = useContext(ProjectContext);

    const [slotsModal, setSlotsModal] = useState(false);
    const [policiesModal, setPoliciesModal] = useState(false);
    const [resizing, setResizing] = useState(false);
    const [storyEditorsKey, setStoryEditorsKey] = useState(shortId.generate());

    const treeRef = useRef();

    const getQueryParams = () => {
        const { location: { query } } = router;
        let queriedIds = query['ids[]'] || [];
        queriedIds = Array.isArray(queriedIds) ? queriedIds : [queriedIds];
        
        return queriedIds;
    };

    const cleanId = id => id.replace(/^.*_SMART_/, '');


    const setStoryMenuSelection = (newSelection) => {
        if (!getQueryParams().every(id => newSelection.includes(id))
        || !newSelection.every(id => getQueryParams().includes(id))) {
            const { location: { pathname } } = router;
            router.replace({ pathname, query: { 'ids[]': newSelection.map(cleanId) } });
        }
        doSetStoryMenuSelection(newSelection);
    };

    useEffect(() => setStoryMenuSelection(getQueryParams().length ? getQueryParams() : storyMenuSelection), []);

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
        .filter(story => story.type === 'story') // no rules
        .map(story => ({ ...story, text: story.title, value: story._id }))
        .sort((storyA, storyB) => {
            if (storyA.text < storyB.text) return -1;
            if (storyA.text > storyB.text) return 1;
            return 0;
        });
    
    const injectProjectIdInStory = useCallback(story => ({ ...story, projectId }), [
        projectId,
    ]);

    const storiesReshaped = useMemo(reshapeStories, [stories]);

    const handleAddStoryGroup = useCallback(
        (storyGroup, f) => Meteor.call(
            'storyGroups.insert',
            { ...storyGroup, projectId },
            wrapMeteorCallback(f),
        ),
        [projectId],
    );

    const handleDeleteGroup = useCallback(
        (storyGroup, f) => Meteor.call(
            'storyGroups.delete',
            { ...storyGroup, projectId },
            wrapMeteorCallback(f),
        ),
        [projectId],
    );

    const handleStoryGroupUpdate = useCallback(
        (storyGroup, f) => Meteor.call(
            'storyGroups.update',
            { ...storyGroup, projectId },
            wrapMeteorCallback(f),
        ),
        [projectId],
    );

    const handleStoryGroupSetExpansion = useCallback(
        (storyGroup, f) => Meteor.call(
            'storyGroups.setExpansion',
            { ...storyGroup, projectId },
            wrapMeteorCallback(f),
        ),
        [projectId],
    );

    const handleStoryDeletion = useCallback(
        (story, f) => Meteor.call(
            'stories.delete',
            injectProjectIdInStory(story),
            wrapMeteorCallback(f),
        ),
        [projectId],
    );

    const handleStoryUpdate = useCallback(
        (story, f) => Meteor.call(
            'stories.update',
            !Array.isArray(story)
                ? injectProjectIdInStory(story)
                : story.map(injectProjectIdInStory),
            wrapMeteorCallback(f),
        ),
        [projectId],
    );

    const handleReloadStories = () => {
        setStoryEditorsKey(shortId.generate());
    };

    const handleGetResponseLocations = (responses, f) => {
        Meteor.call(
            'stories.includesResponse',
            projectId,
            responses,
            wrapMeteorCallback(f),
        );
    };

    const handleLinkToStory = useCallback((id) => {
        const { location: { pathname } } = router;
        const newSelection = [id, ...storyMenuSelection.filter(storyId => storyId !== id)];
        router.replace({ pathname, query: { 'ids[]': newSelection } });
        setStoryMenuSelection(newSelection);
    }, [storyMenuSelection]);

    const handleNewStory = useCallback(
        (story, f) => Meteor.call(
            'stories.insert',
            {
                projectId,
                branches: [],
                steps: [],
                ...story,
            },
            wrapMeteorCallback(() => {
                if (story._id) handleLinkToStory(story._id);
                f();
            }),
        ),
        [projectId],
    );

    useEventListener('keydown', ({ key }) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        if (key === 'ArrowLeft') treeRef.current.focusMenu();
    });

    return (
        <Loading loading={!ready}>
            <ConversationOptionsContext.Provider
                value={{
                    browseToSlots: () => setSlotsModal(true),
                    stories: storiesReshaped,
                    storyGroups,
                    linkToStory: handleLinkToStory,
                    addGroup: handleAddStoryGroup,
                    deleteGroup: handleDeleteGroup,
                    updateGroup: handleStoryGroupUpdate,
                    setExpansionOnGroup: handleStoryGroupSetExpansion,
                    addStory: handleNewStory,
                    deleteStory: handleStoryDeletion,
                    updateStory: handleStoryUpdate,
                    reloadStories: handleReloadStories,
                    getResponseLocations: handleGetResponseLocations,
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
                    className={`no-margin ${resizing ? '' : 'width-transition'}`}
                    onDragStarted={() => setResizing(true)}
                    onDragFinished={() => setResizing(false)}
                    style={{ height: 'calc(100% - 49px)' }}
                    pane1Style={{ overflow: 'hidden' }}
                    pane2Style={{ marginTop: '1rem', overflowY: 'auto' }}
                >
                    <div className='storygroup-browser'>
                        <StoryGroupNavigation
                            allowAddition={can('stories:w', projectId)}
                            placeholderAddItem='Choose a group name'
                            modals={{ setSlotsModal, setPoliciesModal }}
                        />
                        <Loading loading={false}>
                            <StoryGroupTree
                                ref={treeRef}
                                forms={[]}
                                storyGroups={storyGroups}
                                stories={stories}
                                onChangeStoryMenuSelection={setStoryMenuSelection}
                                storyMenuSelection={storyMenuSelection}
                                isDeletionPossible={isDeletionPossible}
                            />
                        </Loading>
                    </div>
                    <Container>
                        <StoryEditors
                            projectId={projectId}
                            selectedIds={storyMenuSelection.map(cleanId)}
                            key={storyEditorsKey}
                        />
                    </Container>
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
    router: PropTypes.object.isRequired,
    storyMenuSelection: PropTypes.array.isRequired,
    setStoryMenuSelection: PropTypes.func.isRequired,
};

Stories.defaultProps = {};

const StoriesWithTracker = withRouter(withTracker((props) => {
    const { projectId } = props;
    const storiesHandler = Meteor.subscribe('stories.light', projectId);
    const storyGroupsHandler = Meteor.subscribe('storiesGroup', projectId);

    const storyGroups = StoryGroups.find().fetch();
    const stories = StoriesCollection.find().fetch();

    return {
        ready: storyGroupsHandler.ready() && storiesHandler.ready(),
        storyGroups,
        stories,
    };
})(Stories));

const mapStateToProps = state => ({
    storyMenuSelection: state.stories.get('storiesCurrent').toJS(),
});

export default connect(mapStateToProps, { setStoryMenuSelection: setStoriesCurrent })(StoriesWithTracker);
