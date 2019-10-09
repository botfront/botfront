import React from 'react';
import { Menu, Tab } from 'semantic-ui-react';
import InfoField from '../../utils/InfoField';

export default [
    {
        menuItem: <Menu.Item content='Docker Compose' />,
        render: () => (
            <Tab.Pane>
                <InfoField name='settings.private.bfApiHost' label='Botfront API host' fontSize={12} data-cy='docker-api-host' />
                <InfoField name='settings.private.actionsServerUrl' label='Action server base URL' fontSize={12} />
                <InfoField name='settings.private.rasaUrl' label='rasa server URL' fontSize={12} />
            </Tab.Pane>
        ),
    },
];
