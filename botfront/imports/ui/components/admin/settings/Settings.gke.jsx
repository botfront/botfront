import { Menu, Tab } from 'semantic-ui-react';
import { AutoField } from 'uniforms-semantic';
import React from 'react';
import InfoField from '../../utils/InfoField';


export default [
    {
        menuItem: <Menu.Item content='GKE settings' />,
        render: () => (
            <Tab.Pane>
                <InfoField name='settings.private.bfApiHost' label='Botfront API host' data-cy='docker-api-host' />
                <InfoField name='settings.private.rasaServerDefaultUrl' label='Rasa server default URL' />
                <InfoField name='settings.private.socketHost' label='Socket host' info='Host of all projects' />
            </Tab.Pane>
        ),
    },
    {
        menuItem: <Menu.Item content='Support' />,
        render: () => (
            <Tab.Pane>
                <AutoField name='settings.public.intercomAppId' />
            </Tab.Pane>
        ),
    },
];
