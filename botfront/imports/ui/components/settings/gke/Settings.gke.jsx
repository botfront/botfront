import React from 'react';
import { Menu, Tab } from 'semantic-ui-react';
import ChatWidgetForm from './ChatWidgetForm';

export default [
    {
        menuItem: <Menu.Item name='Chat widget settings' icon='chat' content='Chat widget' key='Chat widget' />,
        render: () => <Tab.Pane><ChatWidgetForm /></Tab.Pane>,
    },
];
