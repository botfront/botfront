import {
    Container, Placeholder, Menu, Icon, Popup, Label,
} from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';

import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import { Instances } from '../../../api/instances/instances.collection';
import { isTraining } from '../../../api/nlu_model/nlu_model.utils';
import { Projects } from '../../../api/project/project.collection';
import { Slots } from '../../../api/slots/slots.collection';
import { wrapMeteorCallback } from '../utils/Errors';
import TrainButton from '../utils/TrainButton';
import { PageMenu } from '../utils/Utils';
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
        project: { training: { endTime, status } = {} },
        project,
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

    function getResponse(key) {
        Meteor.call('project.findTemplate', projectId, key);
    }

    function updateResponse(response, callback) {
        Meteor.call(
            'project.updateTemplate',
            projectId,
            response.key,
            response,
            wrapMeteorCallback((err, res) => callback(err, res)),
        );
    }

    function insertResponse(response, callback) {
        Meteor.call(
            'project.insertTemplate',
            projectId,
            response,
            wrapMeteorCallback((err, res) => callback(err, res)),
        );
    }

    function addIntent(intent) {
        setAvailableIntents(availableIntents.push(intent));
    }

    function addEntity(entity) {
        setAvailableEntities(availableEntities.push(entity));
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

    return (
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
            }}
        >
            <PageMenu title='Stories' icon='book'>
                <Menu.Menu position='right'>
                    <Menu.Item>
                        {!isTraining(project) && status === 'success' && (
                            <Popup
                                trigger={(
                                    <Icon
                                        size='small'
                                        name='check'
                                        fitted
                                        circular
                                        style={{ color: '#2c662d' }}
                                    />
                                )}
                                content={(
                                    <Label
                                        basic
                                        content={(
                                            <div>
                                                {`Trained ${moment(endTime).fromNow()}`}
                                            </div>
                                        )}
                                        style={{
                                            borderColor: '#2c662d',
                                            color: '#2c662d',
                                        }}
                                    />
                                )}
                            />
                        )}
                        {!isTraining(project) && status === 'failure' && (
                            <Popup
                                trigger={(
                                    <Icon
                                        size='small'
                                        name='warning'
                                        color='red'
                                        fitted
                                        circular
                                    />
                                )}
                                content={(
                                    <Label
                                        basic
                                        color='red'
                                        content={(
                                            <div>
                                                {`Training failed ${moment(
                                                    endTime,
                                                ).fromNow()}`}
                                            </div>
                                        )}
                                    />
                                )}
                            />
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        <TrainButton
                            project={project}
                            instance={instance}
                            projectId={projectId}
                        />
                    </Menu.Item>
                </Menu.Menu>
            </PageMenu>
            <Container>
                <Menu pointing secondary className='hoverable'>
                    <Menu.Item
                        active={activeItem === 'stories'}
                        name='stories'
                        onClick={() => setActiveItem('stories')}
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
}

StoriesContainer.propTypes = {
    projectId: PropTypes.string.isRequired,
    ready: PropTypes.bool.isRequired,
    storyGroups: PropTypes.array.isRequired,
    slots: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

const StoriesWithState = connect(mapStateToProps)(StoriesContainer);

export default withTracker((props) => {
    const { project_id: projectId } = props.params;
    const storyGroupsHandler = Meteor.subscribe('storiesGroup', projectId);
    const projectsHandler = Meteor.subscribe('projects', projectId);
    const instancesHandler = Meteor.subscribe('nlu_instances', projectId);
    const slotsHandler = Meteor.subscribe('slots', projectId);
    const { training } = Projects.findOne(
        { _id: projectId },
        {
            fields: {
                training: 1,
            },
        },
    );
    const instance = Instances.findOne({ projectId });

    const project = {
        _id: projectId,
        training,
    };

    return {
        ready:
            storyGroupsHandler.ready()
            && projectsHandler.ready()
            && instancesHandler.ready()
            && slotsHandler.ready(),
        storyGroups: StoryGroups.find({}).fetch(),
        slots: Slots.find({}).fetch(),
        instance,
        project,
    };
})(StoriesWithState);
