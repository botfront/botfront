import { Container, Placeholder, Menu, Icon, Popup, Label } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import NLUTrainButton from '../nlu/models/NLUTrainButton';
import { isTraining } from '../../../api/nlu_model/nlu_model.utils';
import { Instances } from '../../../api/instances/instances.collection';
import { Projects } from '../../../api/project/project.collection';
import { StoryGroups } from '../../../api/storyGroups/storyGroups.collection';

const Stories = React.lazy(() => import('./Stories'));

function StoriesContainer(props) {
    const {
        projectId,
        ready,
        stories,
        instance,
        project: {
            training: {
                endTime,
                status,
            } = {},
        },
        project,
    } = props;
    function RenderPlaceHolder() {
        return (
            <Container>
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
            </Container>
        );
    }

    return (
        <>  
            <Menu pointing secondary style={{ background: '#fff' }}>
                <Menu.Item>
                    <Menu.Header as='h3'>
                        <Icon name='book' />
                        {'Stories'}
                    </Menu.Header>
                </Menu.Item>
                {props.children}
                <Menu.Menu position='right'>
                    <Menu.Item>
                        {!isTraining(project) && status === 'success' && (
                            <Popup
                                trigger={(
                                    <Icon size='small' name='check' fitted circular style={{ color: '#2c662d' }} />
                                )}
                                content={<Label basic content={<div>{`Trained ${moment(endTime).fromNow()}`}</div>} style={{ borderColor: '#2c662d', color: '#2c662d' }} />}
                            />
                        )}
                        {!isTraining(project) && status === 'failure' && (
                            <Popup
                                trigger={(
                                    <Icon size='small' name='warning' color='red' fitted circular />
                                )}
                                content={<Label basic color='red' content={<div>{`Training failed ${moment(endTime).fromNow()}`}</div>} />}
                            />
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        <NLUTrainButton project={project} instance={instance} />
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
            <React.Suspense fallback={<RenderPlaceHolder />}>
                {ready ? (
                    <Stories
                        projectId={projectId}
                        stories={stories}
                        ready={ready}
                    />
                ) : (
                    <RenderPlaceHolder />
                )}
            </React.Suspense>
        </>
    );
}

StoriesContainer.propTypes = {
    projectId: PropTypes.string.isRequired,
    ready: PropTypes.bool.isRequired,
    stories: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.get('projectId'),
});

const StoriesWithState = connect(mapStateToProps)(StoriesContainer);

export default withTracker((props) => {
    const { project_id: projectId } = props.params;
    const storiesHandler = Meteor.subscribe('storiesGroup', projectId);
    const projectsHandler = Meteor.subscribe('projects', projectId);
    const instancesHandler = Meteor.subscribe('nlu_instances', projectId);
    const {
        training,
    } = Projects.findOne({ _id: projectId }, {
        fields: {
            training: 1,
        },
    });
    const instance = Instances.findOne({ projectId });

    const project = {
        _id: projectId,
        training,
    };

    return {
        ready: storiesHandler.ready() && projectsHandler.ready() && instancesHandler.ready(),
        stories: StoryGroups.find({}).fetch(),
        instance,
        project,
    };
})(StoriesWithState);
