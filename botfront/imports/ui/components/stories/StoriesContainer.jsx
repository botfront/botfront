import {
    Container, Grid, Message, Modal,
} from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setStoryGroup } from '../../store/actions/actions';
import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import { Instances } from '../../../api/instances/instances.collection';
import { Stories } from '../../../api/story/stories.collection';
import { Projects } from '../../../api/project/project.collection';
import { Slots } from '../../../api/slots/slots.collection';
import StoriesPageMenu from './StoriesPageMenu';
import { ConversationOptionsContext } from '../utils/Context';
import StoryGroupBrowser from './StoryGroupBrowser';
import { wrapMeteorCallback } from '../utils/Errors';
import StoryEditors from './StoryEditors';

const SlotsEditor = React.lazy(() => import('./Slots'));
const PoliciesEditor = React.lazy(() => import('../settings/CorePolicy'));

function StoriesContainer(props) {
    const {
        projectId,
        storyGroups,
        slots,
        instance,
        project,
        stories,
        storyGroupCurrent,
        changeStoryGroup,
        ready,
    } = props;

    const [switchToGroupByIdNext, setSwitchToGroupByIdNext] = useState('');
    const [slotsModal, setSlotsModal] = useState(false);
    const [policiesModal, setPoliciesModal] = useState(false);
    const closeModals = () => { setSlotsModal(false); setPoliciesModal(false); };

    const modalWrapper = (open, title, content, scrolling = true) => (
        <Modal open={open} onClose={closeModals}>
            <Modal.Header>{title}</Modal.Header>
            <Modal.Content scrolling={scrolling}>
                <React.Suspense fallback={null}>
                    {content}
                </React.Suspense>
            </Modal.Content>
        </Modal>
    );

    const switchToGroupById = groupId => changeStoryGroup(
        storyGroups.findIndex(sg => sg._id === groupId),
    );
    
    useEffect(() => {
        if (switchToGroupByIdNext) switchToGroupById(switchToGroupByIdNext);
        setSwitchToGroupByIdNext('');
    }, [switchToGroupByIdNext]);

    useEffect(() => {
        if (!storyGroups[storyGroupCurrent]) {
            if ((storyGroups[storyGroupCurrent + 1])) changeStoryGroup(storyGroupCurrent + 1);
            changeStoryGroup(storyGroupCurrent - 1);
        }
    }, [storyGroups.length]);

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

    const handleDeleteGroup = (storyGroup) => { if (!storyGroup.introStory) Meteor.call('storyGroups.delete', storyGroup); }
    const handleStoryGroupSelect = storyGroup => Meteor.call('storyGroups.update', { ...storyGroup, selected: !storyGroup.selected });
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
                onKeyDown={() => {}}
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
                templates: [...project.templates],
                slots,
                stories,
                storyGroups,
            }}
        >
            <StoriesPageMenu project={project} instance={instance} />
            {modalWrapper(slotsModal, 'Slots', <SlotsEditor slots={slots} projectId={projectId} />)}
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

StoriesContainer.propTypes = {
    projectId: PropTypes.string.isRequired,
    ready: PropTypes.bool.isRequired,
    storyGroups: PropTypes.array.isRequired,
    slots: PropTypes.array.isRequired,
    changeStoryGroup: PropTypes.func.isRequired,
    storyGroupCurrent: PropTypes.number,
};

StoriesContainer.defaultProps = {
    storyGroupCurrent: 0,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    storyGroupCurrent: state.stories.get('storyGroupCurrent'),
});

const mapDispatchToProps = {
    changeStoryGroup: setStoryGroup,
};

const StoriesWithState = connect(mapStateToProps, mapDispatchToProps)(StoriesContainer);

export default withTracker((props) => {
    const { project_id: projectId } = props.params;
    const storiesHandler = Meteor.subscribe('stories.light', projectId);
    const storyGroupsHandler = Meteor.subscribe('storiesGroup', projectId);
    const projectsHandler = Meteor.subscribe('projects', projectId);
    const instancesHandler = Meteor.subscribe('nlu_instances', projectId);
    const slotsHandler = Meteor.subscribe('slots', projectId);
    const { training, templates } = Projects.findOne(
        { _id: projectId },
        {
            fields: {
                training: 1,
                'templates.key': 1,
            },
        },
    );
    const instance = Instances.findOne({ projectId });

    return {
        ready:
            storyGroupsHandler.ready()
            && projectsHandler.ready()
            && instancesHandler.ready()
            && slotsHandler.ready()
            && storiesHandler.ready(),
        storyGroups: StoryGroups.find({}, { sort: [['introStory', 'desc']] }).fetch(),
        slots: Slots.find({}).fetch(),
        instance,
        project: { _id: projectId, training, templates },
        stories: Stories.find({}).fetch(),
    };
})(StoriesWithState);
