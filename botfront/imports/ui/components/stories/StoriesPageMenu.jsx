import {
    Menu,
    Icon,
    Popup,
    Label,
} from 'semantic-ui-react';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { withTracker } from 'meteor/react-meteor-data';
import { Instances } from '../../../api/instances/instances.collection';
import { Projects } from '../../../api/project/project.collection';
import { isTraining } from '../../../api/nlu_model/nlu_model.utils';
import TrainButton from '../utils/TrainButton';
import { PageMenu } from '../utils/Utils';

function StoriesPageMenu(props) {
    const {
        project,
        project: { _id: projectId, training: { endTime, status } = {} },
        instance,
        ready,
    } = props;

    if (!ready) return null;
    return (
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
    );
}

StoriesPageMenu.propTypes = {
    ready: PropTypes.bool.isRequired,
    project: PropTypes.any.isRequired,
    instance: PropTypes.object,
};

StoriesPageMenu.defaultProps = {
    instance: null,
};

export default withTracker((props) => {
    const { projectId } = props;
    const projectsHandler = Meteor.subscribe('projects', projectId);
    const instancesHandler = Meteor.subscribe('nlu_instances', projectId);
    const { training } = Projects.findOne(
        { _id: projectId },
        {
            fields: {
                training: 1,
            },
        },
    );
    const instance = Instances.findOne({ projectId });

    return {
        ready:
            projectsHandler.ready()
            && instancesHandler.ready(),
        instance,
        project: { _id: projectId, training },
    };
})(StoriesPageMenu);
