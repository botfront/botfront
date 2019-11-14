import React from 'react';
import { Menu, Tab } from 'semantic-ui-react';
import Deployment from './Deployment.gke';

export default [
    {
        menuItem: <Menu.Item name='deployment' icon='cubes' content='Deployment' key='Deployment' />,
        render: () => <Tab.Pane><Deployment /></Tab.Pane>,
    },
];
