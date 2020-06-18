import { Container, Menu, Tab } from 'semantic-ui-react';
import React from 'react';
import 'react-s-alert/dist/s-alert-default.css';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { PageMenu } from '../utils/Utils';
import Credentials from './Credentials';
import Endpoints from './Endpoints';
import ProjectInfo from './ProjectInfo';
import Instances from './Instances';
import DefaultDomain from './DefaultDomain';
import ImportExportProject from './ImportExportProject';

class Settings extends React.Component {
    handleMoreSettings = () => {
        const { router, projectId } = this.props;
        router.push(`/project/${projectId}/settings/global`);
    }

    getSettingsPanes = () => {
        const panes = [
            {
                menuItem: <Menu.Item data-cy='project-settings-menu-info' icon='info' content='Project Info' key='Project Info' />,
                render: () => <Tab.Pane><ProjectInfo /></Tab.Pane>,
            },
            {
                menuItem: <Menu.Item data-cy='project-settings-menu-credentials' icon='key' content='Credentials' key='Credentials' />,
                render: () => <Tab.Pane><Credentials /></Tab.Pane>,
            },
            {
                menuItem: <Menu.Item data-cy='project-settings-menu-endpoints' icon='code' content='Endpoints' key='Endpoints' />,
                render: () => <Endpoints />,
            },
            {
                menuItem: <Menu.Item data-cy='project-settings-menu-instances' icon='server' content='Instance' key='Instances' />,
                render: () => <Tab.Pane><Instances /></Tab.Pane>,
            },
            {
                menuItem: <Menu.Item data-cy='project-settings-menu-default-domain' icon='globe' content='Default Domain' key='Default Domain' />,
                render: () => <Tab.Pane><DefaultDomain /></Tab.Pane>,
            },
            {
                menuItem: <Menu.Item data-cy='project-settings-menu-import-export' icon='download' content='Import/Export' key='Import/Export' />,
                render: () => <Tab.Pane><ImportExportProject /></Tab.Pane>,
            },
            {
                menuItem: (
                    <Menu.Item
                        data-cy='project-settings-more'
                        icon='ellipsis horizontal'
                        content='More Settings'
                        key='More Settings'
                        onClick={this.handleMoreSettings}
                    />
                ),
            },
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
    router: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(Settings);
