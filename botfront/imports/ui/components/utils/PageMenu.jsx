import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
    Icon, Menu, Label, Popup,
} from 'semantic-ui-react';
import moment from 'moment';
import { isTraining } from '../../../api/nlu_model/nlu_model.utils';
import TrainButton from './TrainButton';
import { ProjectContext } from '../../layouts/context';

export default function PageMenu(props) {
    const {
        title, icon, children, className, headerDataCy, withTraining,
    } = props;
    const {
        project,
        project: { _id: projectId, training: { endTime, status } = {} } = {},
        instance,
    } = useContext(ProjectContext);
    return (
        <Menu borderless className={`top-menu ${className}`}>
            <Menu.Item>
                <Menu.Header as='h3'>
                    {icon && <Icon name={icon} {...(headerDataCy ? { 'data-cy': headerDataCy } : {})} />}
                    {` ${title || ''}`}
                </Menu.Header>
            </Menu.Item>
            {children}
            {withTraining && (
                <>
                    <Menu.Item position='right'>
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
                    <Menu.Item position='right'>
                        <TrainButton
                            project={project}
                            instance={instance}
                            projectId={projectId}
                        />
                    </Menu.Item>
                </>
            )}
        </Menu>
    );
}

PageMenu.defaultProps = {
    children: null,
    className: '',
    headerDataCy: null,
    withTraining: false,
    icon: null,
    title: '',
};

PageMenu.propTypes = {
    title: PropTypes.string,
    icon: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    className: PropTypes.string,
    headerDataCy: PropTypes.string,
    withTraining: PropTypes.bool,
};
