import {
    Container,
    Placeholder,
    Menu,
    Icon,
    Popup,
    Label,
} from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';

import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';
import { Instances } from '../../../api/instances/instances.collection';
import { Stories as StoriesData } from '../../../api/story/stories.collection';
import { isTraining } from '../../../api/nlu_model/nlu_model.utils';
import { Projects } from '../../../api/project/project.collection';
import { Slots } from '../../../api/slots/slots.collection';
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
        stories,
    } = props;
    const [activeItem, setActiveItem] = useState('stories');

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
                templates: [...project.templates],
                slots,
                stories,
                storyGroups,
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
                                                {`Trained ${moment(
                                                    endTime,
                                                ).fromNow()}`}
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
                        <TrainButton project={project} instance={instance} projectId={projectId} />
                    </Menu.Item>
                </Menu.Menu>
            </PageMenu>
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
                            <Stories
                                projectId={projectId}
                                storyGroups={storyGroups}
                            />
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
