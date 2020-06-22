import { Container, Menu, Tab } from 'semantic-ui-react';
import React from 'react';
import 'react-s-alert/dist/s-alert-default.css';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { PageMenu } from '../utils/Utils';
import Credentials from './Credentials';
import Appearance from './Appearance';
import Endpoints from './Endpoints';
import ProjectInfo from './ProjectInfo';
import { can } from '../../../lib/scopes';
import Instances from './Instances';
import DefaultDomain from './DefaultDomain';
import ImportExportProject from './ImportExportProject';
import ChatWidgetForm from './ChatWidgetForm';

class Settings extends React.Component {
    getSettingsPanes = () => {
        const { projectId } = this.props;
        const canViewProjects = can('projects:r', projectId);
        const panes = [
            {
                menuItem: <Menu.Item data-cy='project-settings-menu-info' icon='info' content='Project Info' key='Project Info' />,
                render: () => <Tab.Pane><ProjectInfo /></Tab.Pane>,
            },
            {
                menuItem: <Menu.Item data-cy='project-settings-menu-credentials' icon='key' content='Credentials' key='Credentials' />,
                render: () => <Tab.Pane><Credentials /></Tab.Pane>,
            },
            ...(canViewProjects ? [
                {
                    menuItem: <Menu.Item data-cy='project-settings-menu-endpoints' icon='code' content='Endpoints' key='Endpoints' />,
                    render: () => <Tab.Pane><Endpoints /></Tab.Pane>,
                },
                {
                    menuItem: <Menu.Item data-cy='project-settings-menu-instances' icon='server' content='Instance' key='Instances' />,
                    render: () => <Tab.Pane><Instances /></Tab.Pane>,
                },
                {
                    menuItem: <Menu.Item data-cy='project-settings-menu-appearance' icon='eye' content='Appearance' key='Appearance' />,
                    render: () => <Tab.Pane><Appearance /></Tab.Pane>,
                },
                {
                    menuItem: <Menu.Item name='Chat widget settings' icon='chat' content='Chat widget' key='Chat widget' />,
                    render: () => <Tab.Pane><ChatWidgetForm /></Tab.Pane>,
                },
                {
                    menuItem: <Menu.Item data-cy='project-settings-menu-default-domain' icon='globe' content='Default Domain' key='Default Domain' />,
                    render: () => <Tab.Pane><DefaultDomain /></Tab.Pane>,
                },
                {
                    menuItem: <Menu.Item data-cy='project-settings-menu-import-export' icon='download' content='Import/Export' key='Import/Export' />,
                    render: () => <Tab.Pane><ImportExportProject /></Tab.Pane>,
                },
            ] : []),
        ];
        return panes;
    };

    render() {
        return (
            <>
                <PageMenu title='Settings' icon='setting' />
                <Container>
                    <Tab menu={{ vertical: true }} grid={{ paneWidth: 12, tabWidth: 4 }} panes={this.getSettingsPanes()} />
                </Container>
            </>
        );
    }
}

Settings.propTypes = {
    projectId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(Settings);
