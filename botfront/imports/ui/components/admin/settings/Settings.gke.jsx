import { Menu, Tab } from 'semantic-ui-react';
import { AutoField } from 'uniforms-semantic';
import React from 'react';

import InfoField from '../../utils/InfoField';
import AceField from '../../utils/AceField';

export default [
    {
        menuItem: <Menu.Item content='GKE settings' />,
        render: () => (
            <Tab.Pane>
                <InfoField name='settings.private.bfApiHost' label='Botfront API host' />
                <InfoField name='settings.private.gcpProjectId' label='GCP Project ID' />
                <InfoField name='settings.private.gcpModelsBucket' label='GCS Bucket for Core models' />
                <InfoField name='settings.private.dockerRegistry' label='Docker registry' />
                <InfoField name='settings.private.imagesTag' label='Docker images tag' />
            </Tab.Pane>
        ),
    },
    {
        menuItem: <Menu.Item content='GKE Deployment' />,
        render: () => (
            <Tab.Pane>
                <AceField name='settings.private.defaultDeployment' label='' fontSize={12} convertYaml />
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
