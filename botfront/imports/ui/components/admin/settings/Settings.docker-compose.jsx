import React from 'react';
import { Menu, Tab } from 'semantic-ui-react';
import InfoField from '../../utils/InfoField';

export default [
    {
        menuItem: <Menu.Item content='Docker Compose' />,
        render: () => (
            <Tab.Pane>
                <InfoField name='settings.private.bfApiHost' label='Botfront API host' data-cy='docker-api-host' />
                <InfoField name='settings.private.rootUrl' label='Botfront URL' />
                <InfoField name='settings.private.actionsServerUrl' label='Action server base URL' />
                <InfoField name='settings.private.rasaUrl' label='Rasa server URL' />
            </Tab.Pane>
        ),
    },
];
