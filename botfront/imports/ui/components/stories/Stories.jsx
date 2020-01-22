import {
    Container, Grid, Message, Modal,
} from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setStoryGroup, setStoryMode } from '../../store/actions/actions';
import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import { Stories as StoriesCollection } from '../../../api/story/stories.collection';
import { ProjectContext } from '../../layouts/context';
import { ConversationOptionsContext } from './Context';
import StoryGroupBrowser from './StoryGroupBrowser';
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

    const { slots, subscribeToNewBotResponses } = useContext(ProjectContext);

    const [switchToGroupByIdNext, setSwitchToGroupByIdNext] = useState('');
    const [slotsModal, setSlotsModal] = useState(false);
    const [policiesModal, setPoliciesModal] = useState(false);

    useEffect(() => {
        const unSubscribe = subscribeToNewBotResponses();
        return function cleanup() {
            unSubscribe();
        };
    }, []);

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
                stories,
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
            <Container>
                <Grid className='stories-container'>
                    <Grid.Row columns={2}>
                        <Grid.Column width={4}>
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
                                nameAccessor='name'
                                selectAccessor='selected'
                                toggleSelect={handleStoryGroupSelect}
                                changeName={handleNameChange}
                                placeholderAddItem='Choose a group name'
                                modals={{ setSlotsModal, setPoliciesModal }}
                            />
                        </Grid.Column>

                        <Grid.Column width={12}>
                            <StoryEditors
                                onDeleteGroup={handleDeleteGroup}
                                projectId={projectId}
                                storyGroups={storyGroups}
                                storyGroup={
                                    storyGroups[storyGroupCurrent]
                                    || storyGroups[storyGroupCurrent + 1]
                                    || storyGroups[storyGroupCurrent - 1]
                                }
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
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
    const { projectId } = props;
    const storiesHandler = Meteor.subscribe('stories.light', projectId);
    const storyGroupsHandler = Meteor.subscribe('storiesGroup', projectId);

    // fetch and sort story groups
    const unsortedStoryGroups = StoryGroups.find({}, { sort: [['introStory', 'desc']] }).fetch();
    const sortedStoryGroups = unsortedStoryGroups // sorted on the frontend
        .slice(1)
        .sort((storyGroupA, storyGroupB) => {
            const nameA = storyGroupA.name.toUpperCase();
            const nameB = storyGroupB.name.toUpperCase();
            if (!storyGroupA.query && storyGroupB.query) {
                return 1;
            }
            if (storyGroupA.query && !storyGroupB.query) {
                return -1;
            }
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
    const stories = StoriesCollection.find({}).fetch();

    return {
        ready:
            storyGroupsHandler.ready()
            && storiesHandler.ready(),
        storyGroups,
        stories,
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
