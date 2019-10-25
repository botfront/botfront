/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';
import { Menu, Divider, Icon } from 'semantic-ui-react';
import { Link } from 'react-router';
import { withTracker } from 'meteor/react-meteor-data';

import { Projects } from '../../../api/project/project.collection';
import ProjectsDropdown from './ProjectsDropdown';
import { can, Can } from '../../../lib/scopes';
import { GlobalSettings } from '../../../api/globalSettings/globalSettings.collection';

class ProjectSidebar extends React.Component {
    render() {
        const {
            projectName, projectId, handleChangeProject, settingsReady, settings, triggerIntercom, renderLegacyModels,
        } = this.props;
        const intercomId = settingsReady ? settings.settings.public.intercomAppId : null;

        return (
            <DocumentTitle title={projectName}>
                <Menu vertical inverted pointing className='project-menu' data-cy='project-menu'>
                    <Menu.Item>
                        <Menu.Header style={{ marginBottom: '20px' }}>Project</Menu.Header>
                        <ProjectsDropdown currentProjectId={projectId} onProjectChange={handleChangeProject} />
                    </Menu.Item>
                    <Can I='stories:r' projectId={projectId}>
                        <Link to={`/project/${projectId}/stories`}>
                            <Menu.Item name='Stories' icon='book' />
                        </Link>
                    </Can>
                    <Can I='nlu-data:r' projectId={projectId}>
                        <>
                            <Link to={`/project/${projectId}/nlu/models`}>
                                <Menu.Item name='NLU' icon='grid layout' />
                            </Link>
                            {renderLegacyModels && (
                                <Link to={`/project/${projectId}/nlu/legacy-models`}>
                                    <Menu.Item name='Legacy NLU' icon='history' />
                                </Link>
                            )}
                        </>
                    </Can>
                    <Can I='responses:r' projectId={projectId}>
                        <Link to={`/project/${projectId}/dialogue/templates`}>
                            <Menu.Item name='Responses' icon='comment' />
                        </Link>
                    </Can>
                    <Can I='conversations:r' projectId={projectId}>
                        <Link to={`/project/${projectId}/dialogue/conversations/`}>
                            <Menu.Item name='Conversations' icon='comments' />
                        </Link>
                    </Can>
                    <Can I='conversations:r' projectId={projectId}>
                        <Link to={`/project/${projectId}/analytics`}>
                            <Menu.Item name='Analytics' icon='chart line' />
                        </Link>
                    </Can>
                    <Can I='project-settings:r' projectId={projectId}>
                        <Link to={`/project/${projectId}/settings`}>
                            <Menu.Item name='Settings' icon='setting' />
                        </Link>
                    </Can>
                    <a href={settingsReady ? settings.settings.public.docUrl : ''} target='_blank' rel='noopener noreferrer'>
                        <Menu.Item name='documentation' icon='question' />
                    </a>
                    {intercomId && (
                        <span>
                            <Menu.Item name='Support' onClick={() => triggerIntercom(intercomId)} icon='bell' />
                        </span>
                    )}
                    <Divider inverted />
                    {can('global-admin') && (
                        <Link to='/admin/'>
                            <Menu.Item name='Admin' icon='key' />
                        </Link>
                    )}
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
