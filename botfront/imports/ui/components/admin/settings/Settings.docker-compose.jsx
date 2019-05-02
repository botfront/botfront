import React from 'react';
import { Menu, Tab } from 'semantic-ui-react';
import InfoField from '../../utils/InfoField';

export default [
    {
        menuItem: <Menu.Item content='Docker Compose' />,
        render: () => (
            <Tab.Pane>
                <InfoField name='settings.private.bfApiHost' label='Botfront API host' fontSize={12} />
            </Tab.Pane>
        ),
    },
];
