import React from 'react';
import { Menu, Tab } from 'semantic-ui-react';
import Deployment from './Deployment.gke';
import ModelUpload from './ModelUpload.gke';

export default [
    {
        menuItem: <Menu.Item className='project-settings-menu-models' icon='grid layout' content='Core Model' key='Core Model' />,
        render: () => <Tab.Pane><ModelUpload /></Tab.Pane>,
    },
    {
        menuItem: <Menu.Item name='deployment' icon='cubes' content='Deployment' key='Deployment' />,
        render: () => <Tab.Pane><Deployment /></Tab.Pane>,
    },
];
