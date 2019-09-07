/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';
import { Menu, Divider } from 'semantic-ui-react';
import { Link } from 'react-router';
import { withTracker } from 'meteor/react-meteor-data';

import { Projects } from '../../../api/project/project.collection';
import ProjectsDropdown from './ProjectsDropdown';
import { GlobalSettings } from '../../../api/globalSettings/globalSettings.collection';

class ProjectSidebar extends React.Component {
    render() {
        const {
            projectName, projectId, handleChangeProject, settingsReady, settings, triggerIntercom, renderLegacyModels,
        } = this.props;
        const intercomId = settingsReady ? settings.settings.public.intercomAppId : null;

        return (
            <DocumentTitle title={projectName}>
                <Menu vertical inverted pointing className='project-menu'>
                    <Menu.Item>
                        <Menu.Header style={{ marginBottom: '20px' }}>Project</Menu.Header>
                        <ProjectsDropdown currentProjectId={projectId} onProjectChange={handleChangeProject} />
                    </Menu.Item>
                    <Link to={`/project/${projectId}/stories`}>
                        <Menu.Item name='Stories' icon='book' />
                    </Link>
                    <Link to={`/project/${projectId}/nlu/models`}>
                        <Menu.Item name='NLU' icon='grid layout' />
                    </Link>
                    {renderLegacyModels && (
                        <Link to={`/project/${projectId}/nlu/legacy-models`}>
                            <Menu.Item name='Legacy NLU' icon='history' />
                        </Link>
                    )}
                    <Link to={`/project/${projectId}/dialogue/templates`}>
                        <Menu.Item name='Responses' icon='comment' />
                    </Link>
                    <Link to={`/project/${projectId}/dialogue/conversations/p/1`}>
                        <Menu.Item name='Conversations' icon='comments' />
                    </Link>
                    <Link to={`/project/${projectId}/settings`}>
                        <Menu.Item name='Settings' icon='setting' />
                    </Link>
                    <a href={settingsReady ? settings.settings.public.docUrl : ''} target='_blank' rel='noopener noreferrer'>
                        <Menu.Item name='documentation' icon='question' />
                    </a>
                    <a href={settingsReady ? 'https://spectrum.chat/botfront' : ''} target='_blank' rel='noopener noreferrer'>
                        <Menu.Item name='help' icon='bell' content='Get help' />
                    </a>
                    <Divider inverted />
                        <Link to='/login'>
                            <Menu.Item data-cy='signout' name='Sign out' icon='sign-out' />
                        </Link>
                    <Divider inverted />
                </Menu>
            </DocumentTitle>
        );
    }
}

ProjectSidebar.propTypes = {
    projectId: PropTypes.string.isRequired,
    projectName: PropTypes.string.isRequired,
    handleChangeProject: PropTypes.func.isRequired,
    settingsReady: PropTypes.bool.isRequired,
    settings: PropTypes.object,
    triggerIntercom: PropTypes.func.isRequired,
    renderLegacyModels: PropTypes.bool.isRequired,
};

ProjectSidebar.defaultProps = {
    settings: null,
};

const ProjectSidebarContainer = withTracker((props) => {
    const { projectId } = props;
    const settingsHandler = Meteor.subscribe('settings');
    const settings = GlobalSettings.findOne({}, { fields: { 'settings.public.docUrl': 1, 'settings.public.intercomAppId': 1 } });
    const currentProject = Projects.find({ _id: projectId }).fetch();
    const projectName = currentProject.length > 0 ? `${currentProject[0].name}` : 'Botfront by Mr. Bot';

    return {
        projectName,
        settingsReady: settingsHandler.ready(),
        settings,
    };
})(ProjectSidebar);

export default ProjectSidebarContainer;
