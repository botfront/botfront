import {
    Menu,
    Icon,
    Popup,
    Label,
} from 'semantic-ui-react';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';

import { withTracker } from 'meteor/react-meteor-data';
import { Instances } from '../../../api/instances/instances.collection';
import { Projects } from '../../../api/project/project.collection';
import { isTraining, getPublishedNluModelLanguages } from '../../../api/nlu_model/nlu_model.utils';
import TrainButton from '../utils/TrainButton';
import { PageMenu } from '../utils/Utils';
import LanguageDropdown from '../common/LanguageDropdown';
import { setWorkingLanguage } from '../../store/actions/actions';

function StoriesPageMenu(props) {
    const {
        project,
        project: { _id: projectId, training: { endTime, status } = {} },
        instance,
        ready,
        workingLanguage,
        changeWorkingLanguage,
        projectLanguages,
    } = props;

    if (!ready) return null;
    return (
        <PageMenu title='Stories' icon='book'>
            <Menu.Item id='stories-language-dropdown'>
                <LanguageDropdown
                    languageOptions={projectLanguages}
                    selectedLanguage={workingLanguage}
                    handleLanguageChange={changeWorkingLanguage}
                />
            </Menu.Item>
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
    workingLanguage: PropTypes.string,
    changeWorkingLanguage: PropTypes.func.isRequired,
    projectLanguages: PropTypes.array,
};

StoriesPageMenu.defaultProps = {
    instance: null,
    workingLanguage: null,
    projectLanguages: [],
};

const mapStateToProps = state => ({
    workingLanguage: state.settings.get('workingLanguage'),
});

const mapDispatchToProps = {
    changeWorkingLanguage: setWorkingLanguage,
};

const StoriesPageMenuWithState = connect(
    mapStateToProps,
    mapDispatchToProps,
)(StoriesPageMenu);

export default withTracker((props) => {
    const { projectId } = props;
    const projectsHandler = Meteor.subscribe('projects', projectId);
    const instancesHandler = Meteor.subscribe('nlu_instances', projectId);
    const { training, nlu_models: nluModels } = Projects.findOne(
        { _id: projectId },
        {
            fields: {
                training: 1,
                nlu_models: 1,
            },
        },
    );
    const instance = Instances.findOne({ projectId });

    const projectLanguages = getPublishedNluModelLanguages(nluModels, true);

    return {
        ready:
            projectsHandler.ready()
            && instancesHandler.ready(),
        instance,
        project: { _id: projectId, training },
        projectLanguages,
    };
})(StoriesPageMenuWithState);
