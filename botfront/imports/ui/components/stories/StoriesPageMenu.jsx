import {
    Menu,
    Icon,
    Popup,
    Label,
} from 'semantic-ui-react';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { isTraining } from '../../../api/nlu_model/nlu_model.utils';
import TrainButton from '../utils/TrainButton';
import { PageMenu } from '../utils/Utils';

export default function StoriesPageMenu(props) {
    const {
        project,
        project: { _id: projectId, training: { endTime, status } = {} },
        instance,
    } = props;

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
    project: PropTypes.any.isRequired,
    instance: PropTypes.string.isRequired,
};
