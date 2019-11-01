import {
    Container,
    Placeholder,
    Menu,
} from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import { Instances } from '../../../api/instances/instances.collection';
import { Stories as StoriesData } from '../../../api/story/stories.collection';
import { Projects } from '../../../api/project/project.collection';
import { Slots } from '../../../api/slots/slots.collection';
import { wrapMeteorCallback } from '../utils/Errors';
import StoriesPageMenu from './StoriesPageMenu';
import { ConversationOptionsContext } from '../utils/Context';

const Stories = React.lazy(() => import('./Stories'));
const SlotsEditor = React.lazy(() => import('./Slots'));

function StoriesContainer(props) {
    const {
        projectId,
        ready,
        storyGroups,
        slots,
        instance,
        project,
        stories,
    } = props;
    const [activeItem, setActiveItem] = useState('stories');
    const [availableIntents, setAvailableIntents] = useState([]);
    const [availableEntities, setAvailableEntities] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [language, setLanguage] = useState('en');

    // By passing an empty array as the second argument to this useEffect
    // We make it so UseEffect is only called once, onMount
    useEffect(() => {
        Meteor.call(
            'project.getEntitiesAndIntents',
            projectId,
            wrapMeteorCallback((err, res) => {
                if (!err) {
                    setAvailableEntities(res.entities);
                    setAvailableIntents(res.intents);
                }
            }),
        );
        Meteor.call(
            'project.getDefaultLanguage',
            projectId,
            wrapMeteorCallback((err, res) => setLanguage(res)),
        );
    }, []);

    // This effect is triggered everytime the slot prop changes
    useEffect(() => {
        setAvailableSlots(slots);
    }, [slots]);

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
        setAvailableIntents([...new Set([...availableIntents, newIntent])]);
    }

    function addEntity(newEntity) {
        setAvailableEntities([...new Set([...availableEntities, newEntity])]);
    }

    function RenderPlaceHolder() {
        return (
            <Placeholder>
                <Placeholder.Paragraph>
                    <Placeholder.Line />
                    <Placeholder.Line />
                    <Placeholder.Line />
                    <Placeholder.Line />
                    <Placeholder.Line />
                </Placeholder.Paragraph>
                <Placeholder.Paragraph>
                    <Placeholder.Line />
                    <Placeholder.Line />
                    <Placeholder.Line />
                </Placeholder.Paragraph>
            </Placeholder>
        );
    }

    const renderStoriesContainer = () => (
        <ConversationOptionsContext.Provider
            value={{
                intents: availableIntents,
                entities: availableEntities,
                slots: availableSlots,
                language,
                insertResponse,
                updateResponse,
                getResponse,
                addEntity,
                addIntent,
                getUtteranceFromPayload,
                parseUtterance,
                addUtteranceToTrainingData,
                browseToSlots: () => setActiveItem('slots'),
                templates: [...project.templates],
                stories,
                storyGroups,
            }}
        >
            <StoriesPageMenu project={project} instance={instance} />
            <Container>
                <Menu pointing secondary className='hoverable'>
                    <Menu.Item
                        active={activeItem === 'stories'}
                        name='stories'
                        onClick={() => setActiveItem('stories')}
                        data-cy='stories-tab'
                    >
                        Stories
                    </Menu.Item>
                    <Menu.Item
                        active={activeItem === 'slots'}
                        name='slots'
                        onClick={() => setActiveItem('slots')}
                        data-cy='slots-tab'
                    >
                        Slots
                    </Menu.Item>
                </Menu>
                {activeItem === 'stories' && (
                    <React.Suspense fallback={RenderPlaceHolder()}>
                        {ready ? (
                            <Stories projectId={projectId} storyGroups={storyGroups} />
                        ) : (
                            RenderPlaceHolder()
                        )}
                    </React.Suspense>
                )}
                {activeItem === 'slots' && (
                    <React.Suspense fallback={RenderPlaceHolder()}>
                        {ready ? (
                            <SlotsEditor slots={slots} projectId={projectId} />
                        ) : (
                            RenderPlaceHolder()
                        )}
                    </React.Suspense>
                )}
            </Container>
        </ConversationOptionsContext.Provider>
    );

    return (renderStoriesContainer());
}

StoriesContainer.propTypes = {
    projectId: PropTypes.string.isRequired,
    ready: PropTypes.bool.isRequired,
    storyGroups: PropTypes.array.isRequired,
    slots: PropTypes.array.isRequired,
    instance: PropTypes.object,
    project: PropTypes.object,
};

StoriesContainer.defaultProps = {
    instance: {},
    project: {},
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

const StoriesWithState = connect(mapStateToProps)(StoriesContainer);

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

    const project = {
        _id: projectId,
        training,
        templates,
    };

    return {
        ready:
            storyGroupsHandler.ready()
            && projectsHandler.ready()
            && instancesHandler.ready()
            && slotsHandler.ready()
            && storiesHandler.ready(),
        storyGroups: StoryGroups.find({}).fetch(),
        slots: Slots.find({}).fetch(),
        instance,
        project,
        stories: StoriesData.find({}).fetch(),
    };
})(StoriesWithState);
