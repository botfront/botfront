import {
    Container, Grid, Message, Modal,
} from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setStoryGroup, setStoryMode } from '../../store/actions/actions';
import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import { Stories as StoriesCollection } from '../../../api/story/stories.collection';
import { Instances } from '../../../api/instances/instances.collection';
import { Projects } from '../../../api/project/project.collection';
import { Slots } from '../../../api/slots/slots.collection';
import { ConversationOptionsContext } from '../utils/Context';
import StoryGroupBrowser from './StoryGroupBrowser';
import { wrapMeteorCallback } from '../utils/Errors';
import StoryEditors from './StoryEditors';

const SlotsEditor = React.lazy(() => import('./Slots'));
const PoliciesEditor = React.lazy(() => import('../settings/CorePolicy'));

function Stories(props) {
    const {
        projectId,
        storyGroups,
        slots,
        instance,
        project,
        stories,
        storyGroupCurrent,
        storyMode,
        changeStoryGroup,
        changeStoryMode,
        ready,
    } = props;

    const [intents, setIntents] = useState([]);
    const [entities, setEntities] = useState([]);
    const [language, setLanguage] = useState('en');

    const [switchToGroupByIdNext, setSwitchToGroupByIdNext] = useState('');
    const [slotsModal, setSlotsModal] = useState(false);
    const [policiesModal, setPoliciesModal] = useState(false);
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

    useEffect(() => {
        if (!storyGroups[storyGroupCurrent]) {
            if (storyGroups[storyGroupCurrent + 1]) changeStoryGroup(storyGroupCurrent + 1);
            changeStoryGroup(storyGroupCurrent - 1);
        }
    }, [storyGroups.length]);

    // By passing an empty array as the second argument to this useEffect
    // We make it so UseEffect is only called once, onMount
    useEffect(() => {
        Meteor.call(
            'project.getEntitiesAndIntents',
            projectId,
            wrapMeteorCallback((err, res) => {
                if (!err) {
                    setEntities(res.entities);
                    setIntents(res.intents);
                }
            }),
        );
        Meteor.call(
            'project.getDefaultLanguage',
            projectId,
            wrapMeteorCallback((err, res) => setLanguage(res)),
        );
    }, []);

    function getResponse(key, callback = () => {}) {
        Meteor.call(
            'project.findTemplate',
            projectId,
            key,
            language,
            wrapMeteorCallback((err, res) => callback(err, res)),
        );
    }

    function addUtteranceToTrainingData(utterance, callback = () => {}) {
        Meteor.call(
            'nlu.insertExamplesWithLanguage',
            projectId,
            language,
            [utterance],
            wrapMeteorCallback((err, res) => callback(err, res)),
        );
    }

    function updateResponse(response, callback = () => {}) {
        Meteor.call(
            'project.updateTemplate',
            projectId,
            response.key,
            response,
            wrapMeteorCallback((err, res) => callback(err, res)),
        );
    }

    function insertResponse(response, callback = () => {}) {
        Meteor.call(
            'project.insertTemplate',
            projectId,
            response,
            wrapMeteorCallback((err, res) => callback(err, res)),
        );
    }

    function getUtteranceFromPayload(payload, callback = () => {}) {
        Meteor.call(
            'nlu.getUtteranceFromPayload',
            projectId,
            payload,
            language,
            (err, res) => callback(err, res),
        );
    }

    function parseUtterance(utterance) {
        return Meteor.callWithPromise(
            'rasa.parse',
            instance,
            [{ text: utterance, lang: language }],
            true,
        );
    }

    function addIntent(newIntent) {
        setIntents([...new Set([...intents, newIntent])]);
    }

    function addEntity(newEntity) {
        setEntities([...new Set([...entities, newEntity])]);
    }

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
        if (!storyGroup.introStory) Meteor.call('storyGroups.delete', storyGroup);
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
                intents,
                entities,
                slots,
                language,
                insertResponse,
                updateResponse,
                getResponse,
                addEntity,
                addIntent,
                getUtteranceFromPayload,
                parseUtterance,
                addUtteranceToTrainingData,
                browseToSlots: () => setSlotsModal(true),
                templates: [...project.templates],
                stories,
                storyGroups,
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
    project: PropTypes.object.isRequired,
    ready: PropTypes.bool.isRequired,
    storyGroups: PropTypes.array.isRequired,
    slots: PropTypes.array.isRequired,
    changeStoryGroup: PropTypes.func.isRequired,
    changeStoryMode: PropTypes.func.isRequired,
    storyGroupCurrent: PropTypes.number,
    storyMode: PropTypes.string,
};

Stories.defaultProps = {
    storyGroupCurrent: 0,
    storyMode: 'visual',
};

const mapStateToProps = state => ({
    storyGroupCurrent: state.stories.get('storyGroupCurrent'),
    storyMode: state.stories.get('storyMode'),
});

const mapDispatchToProps = {
    changeStoryGroup: setStoryGroup,
    changeStoryMode: setStoryMode,
};

const StoriesWithState = connect(
    mapStateToProps,
    mapDispatchToProps,
)(Stories);

export default withTracker((props) => {
    const { projectId } = props;
    const storiesHandler = Meteor.subscribe('stories.light', projectId);
    const storyGroupsHandler = Meteor.subscribe('storiesGroup', projectId);
    const projectsHandler = Meteor.subscribe('projects', projectId);
    const instancesHandler = Meteor.subscribe('nlu_instances', projectId);
    const slotsHandler = Meteor.subscribe('slots', projectId);
    const { templates } = Projects.findOne(
        { _id: projectId },
        {
            fields: {
                'templates.key': 1,
            },
        },
    );
    const instance = Instances.findOne({ projectId });

    const project = {
        _id: projectId,
        templates,
    };

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
        project,
        stories: StoriesCollection.find({}).fetch(),
    };
})(StoriesWithState);
