import '../../../lib/dynamic_import';
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

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = { orchestratorMenuItems: null, orchestrator: null };
    }

    async componentDidMount() {
        const orchestrator = await Meteor.callWithPromise('orchestration.type');
        let orchestratorMenuItems = null;
        if (orchestrator !== 'default') {
            try {
                const { default: def } = await import(`./${orchestrator}/Settings.${orchestrator}`);
                orchestratorMenuItems = def;
            } catch (e) {
                // eslint-disable-next-line no-console
                if (!process.env.production) console.log('this is not displayed in production environment \n', e);
            }
        }

        this.setState({ orchestratorMenuItems, orchestrator });
    }

    getSettingsPanes = () => {
        const { orchestratorMenuItems, orchestrator } = this.state;
        const { projectId } = this.props;
        let panes = [
            {
                menuItem: <Menu.Item data-cy='project-settings-menu-info' icon='info' content='Project Info' key='Project Info' />,
                render: () => <Tab.Pane><ProjectInfo /></Tab.Pane>,
            },
            {
                menuItem: <Menu.Item data-cy='project-settings-menu-credentials' icon='key' content='Credentials' key='Credentials' />,
                render: () => <Tab.Pane><Credentials orchestrator={orchestrator} /></Tab.Pane>,
            },
            {
                menuItem: <Menu.Item data-cy='project-settings-menu-default-domain' icon='globe' content='Default Domain' key='Default Domain' />,
                render: () => <Tab.Pane><DefaultDomain /></Tab.Pane>,
            },
            {
                menuItem: <Menu.Item data-cy='project-settings-menu-import-export' icon='download' content='Import/Export' key='Import/Export' />,
                render: () => <Tab.Pane><ImportExportProject /></Tab.Pane>,
            },
        ];
       

        if (can('projects:r', projectId)) {
            panes = [...panes,
                {
                    menuItem: <Menu.Item data-cy='project-settings-menu-endpoints' icon='code' content='Endpoints' key='Endpoints' />,
                    render: () => <Tab.Pane><Endpoints orchestrator={orchestrator} /></Tab.Pane>,
                },
                {
                    menuItem: <Menu.Item data-cy='project-settings-menu-instances' icon='server' content='Instance' key='Instances' />,
                    render: () => <Tab.Pane><Instances /></Tab.Pane>,
                },
                {
                    menuItem: <Menu.Item data-cy='project-settings-menu-appearance' icon='eye' content='Appearance' key='Appearance' />,
                    render: () => <Tab.Pane><Appearance /></Tab.Pane>,
                },
            ];

            if (orchestratorMenuItems) {
                panes = panes.concat(orchestratorMenuItems);
            }
        }
     
       
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
