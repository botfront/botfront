import {
    Container, Grid, Message, Modal,
} from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks';
import { setStoryGroup, setStoryMode, setWorkingLanguage } from '../../store/actions/actions';
import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import { Stories as StoriesCollection } from '../../../api/story/stories.collection';
import { Instances } from '../../../api/instances/instances.collection';
import { Projects } from '../../../api/project/project.collection';
import { Slots } from '../../../api/slots/slots.collection';
import { ConversationOptionsContext } from '../utils/Context';
import StoryGroupBrowser from './StoryGroupBrowser';
import { wrapMeteorCallback } from '../utils/Errors';
import StoryEditors from './StoryEditors';
import { GET_BOT_RESPONSES, GET_BOT_RESPONSE } from './queries';
import {
    CREATE_BOT_RESPONSE,
    UPDATE_BOT_RESPONSE,
} from './mutations';

const SlotsEditor = React.lazy(() => import('./Slots'));
const PoliciesEditor = React.lazy(() => import('../settings/CorePolicy'));

function Stories(props) {
    const {
        projectId,
        storyGroups,
        slots,
        instance,
        stories,
        storyGroupCurrent,
        storyMode,
        changeStoryGroup,
        changeStoryMode,
        ready,
        workingLanguage,
    } = props;

    const [intents, setIntents] = useState([]);
    const [entities, setEntities] = useState([]);
    const [switchToGroupByIdNext, setSwitchToGroupByIdNext] = useState('');
    const [slotsModal, setSlotsModal] = useState(false);
    const [policiesModal, setPoliciesModal] = useState(false);

    const [createBotResponse] = useMutation(CREATE_BOT_RESPONSE);
    const [updateBotResponse] = useMutation(UPDATE_BOT_RESPONSE);
    /* the client is used here because the lazy queries don't have a callback option and aren't a promise either
    so getting the results of the query to return them is not possible
    const [loadResponse, { loadingResponse, data: response }] = useLazyQuery(GET_BOT_RESPONSE);
    */
    const client = useApolloClient();

    const { loading, data: responses } = useQuery(GET_BOT_RESPONSES, {
        variables: { projectId }, pollInterval: 5000,
    });
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
    }, []);

    function getResponse(key, callback = () => {}) {
        client.query({
            query: GET_BOT_RESPONSE,
            variables: {
                projectId,
                key,
                lang: workingLanguage || 'en',
            },
        }).then(
            (result) => {
                callback(undefined, result.data.botResponse);
            },
            (error) => {
                callback(error);
            },
        );
    }

    function addUtteranceToTrainingData(utterance, callback = () => {}) {
        Meteor.call(
            'nlu.insertExamplesWithLanguage',
            projectId,
            workingLanguage,
            [utterance],
            wrapMeteorCallback((err, res) => callback(err, res)),
        );
    }

    function updateResponse(newResponse, callback = () => {}) {
        /* apollo add a __typename field to all of its object for caching purposes
         we need to remmove it so the update do not fail because a field is unrecognised
         
         JSON.parse accept reviver function that is applied to every key/value pair  withing an object
         */
         
        const omitTypename = (key, value) => (key === '__typename' ? undefined : value);
        const cleanedResponse = JSON.parse(JSON.stringify(newResponse), omitTypename);
        updateBotResponse({
            variables: { projectId, response: cleanedResponse, key: newResponse.key },
        }).then(
            (result) => {
                callback(undefined, result);
            },
            (error) => {
                callback(error);
            },
        );
    }

    function insertResponse(newResponse, callback = () => {}) {
        // onCompleted and onError seems to have issues currently https://github.com/apollographql/react-apollo/issues/2293
        createBotResponse({
            variables: { projectId, response: newResponse },
        }).then(
            (result) => {
                callback(undefined, result);
            },
            (error) => {
                callback(error);
            },
        );
    }

    function getUtteranceFromPayload(payload, callback = () => {}) {
        Meteor.call(
            'nlu.getUtteranceFromPayload',
            projectId,
            payload,
            workingLanguage,
            (err, res) => callback(err, res),
        );
    }

    function parseUtterance(utterance) {
        return Meteor.callWithPromise(
            'rasa.parse',
            instance,
            [{ text: utterance, lang: workingLanguage }],
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
                language: workingLanguage,
                insertResponse,
                updateResponse,
                getResponse,
                addEntity,
                addIntent,
                getUtteranceFromPayload,
                parseUtterance,
                addUtteranceToTrainingData,
                browseToSlots: () => setSlotsModal(true),
                templates: responses ? responses.botResponses : [],
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

    if (ready && !loading) return renderStoriesContainer();
    return null;
}

Stories.propTypes = {
    projectId: PropTypes.string.isRequired,
    ready: PropTypes.bool.isRequired,
    storyGroups: PropTypes.array.isRequired,
    slots: PropTypes.array.isRequired,
    changeStoryGroup: PropTypes.func.isRequired,
    changeStoryMode: PropTypes.func.isRequired,
    storyGroupCurrent: PropTypes.number,
    storyMode: PropTypes.string,
    workingLanguage: PropTypes.string,
    changeWorkingLanguage: PropTypes.func.isRequired,
    defaultLanguage: PropTypes.string,
};

Stories.defaultProps = {
    storyGroupCurrent: 0,
    storyMode: 'visual',
    workingLanguage: null,
    defaultLanguage: '',
};

const StoriesWithTracker = withTracker((props) => {
    const { projectId, workingLanguage, changeWorkingLanguage } = props;
    const storiesHandler = Meteor.subscribe('stories.light', projectId);
    const storyGroupsHandler = Meteor.subscribe('storiesGroup', projectId);
    const projectsHandler = Meteor.subscribe('projects', projectId);
    const instancesHandler = Meteor.subscribe('nlu_instances', projectId);
    const slotsHandler = Meteor.subscribe('slots', projectId);
    const { defaultLanguage } = Projects.findOne(
        { _id: projectId },
        {
            fields: {
                defaultLanguage: 1,
            },
        },
    );
    const instance = Instances.findOne({ projectId });


    // fetch and sort story groups
    const unsortedStoryGroups = StoryGroups.find({}, { sort: [['introStory', 'desc']] }).fetch();
    const sortedStoryGroups = unsortedStoryGroups // sorted on the frontend
        .slice(1)
        .sort((storyGroupA, storyGroupB) => {
            const nameA = storyGroupA.name.toUpperCase();
            const nameB = storyGroupB.name.toUpperCase();
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

    if (!workingLanguage && defaultLanguage) changeWorkingLanguage(defaultLanguage);

    return {
        ready:
            storyGroupsHandler.ready()
            && projectsHandler.ready()
            && instancesHandler.ready()
            && slotsHandler.ready()
            && storiesHandler.ready(),
        storyGroups,
        slots: Slots.find({}).fetch(),
        instance,
        stories: StoriesCollection.find({}).fetch(),
        defaultLanguage,
    };
})(Stories);

const mapStateToProps = state => ({
    storyGroupCurrent: state.stories.get('storyGroupCurrent'),
    storyMode: state.stories.get('storyMode'),
    workingLanguage: state.settings.get('workingLanguage'),
});

const mapDispatchToProps = {
    changeStoryGroup: setStoryGroup,
    changeStoryMode: setStoryMode,
    changeWorkingLanguage: setWorkingLanguage,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(StoriesWithTracker);
