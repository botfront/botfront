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
    componentDidMount() {
        const { params: { setting } = {}, router } = this.props;
        const { location: { pathname } } = router;
        if (setting && this.getSettingsPanes().findIndex(p => p.name === setting) < 0) {
            router.replace({ pathname: `${pathname.split('/settings')[0]}/settings` });
        }
    }

    handleMoreSettings = () => {
        const { router, projectId } = this.props;
        router.push(`/project/${projectId}/settings/global`);
    }

    setActiveTab = (index) => {
        const { router } = this.props;
        const { location: { pathname } } = router;
        router.push({ pathname: `${pathname.split('/settings')[0]}/settings/${this.getSettingsPanes()[index].name}` });
    };

    getSettingsPanes = () => {
        const panes = [
            {
                name: 'info',
                menuItem: <Menu.Item data-cy='project-settings-menu-info' icon='info' content='Project Info' key='Project Info' />,
                render: () => <Tab.Pane><ProjectInfo /></Tab.Pane>,
            },
            {
                name: 'credentials',
                menuItem: <Menu.Item data-cy='project-settings-menu-credentials' icon='key' content='Credentials' key='Credentials' />,
                render: () => <Tab.Pane><Credentials /></Tab.Pane>,
            },
            {
                name: 'endpoints',
                menuItem: <Menu.Item data-cy='project-settings-menu-endpoints' icon='code' content='Endpoints' key='Endpoints' />,
                render: () => <Tab.Pane><Endpoints /></Tab.Pane>,
            },
            {
                name: 'instance',
                menuItem: <Menu.Item data-cy='project-settings-menu-instances' icon='server' content='Instance' key='Instances' />,
                render: () => <Tab.Pane><Instances /></Tab.Pane>,
            },
            {
                name: 'default-domain',
                menuItem: <Menu.Item data-cy='project-settings-menu-default-domain' icon='globe' content='Default Domain' key='Default Domain' />,
                render: () => <Tab.Pane><DefaultDomain /></Tab.Pane>,
            },
            {
                name: 'import-export',
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
        const { params: { setting } = {} } = this.props;
        return (
            <>
                <PageMenu title='Settings' icon='setting' />
                <Container>
                    <Tab
                        menu={{ vertical: true }}
                        grid={{ paneWidth: 12, tabWidth: 4 }}
                        panes={this.getSettingsPanes()}
                        activeIndex={setting ? this.getSettingsPanes().findIndex(p => p.name === setting) : 0}
                        onTabChange={(_, data) => {
                            if (this.getSettingsPanes()[data.activeIndex].name) this.setActiveTab(data.activeIndex);
                        }}
                    />
                </Container>
            </>
        );
    }
}

Settings.propTypes = {
    projectId: PropTypes.string.isRequired,
    router: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(Settings);
