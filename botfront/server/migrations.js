import { Roles } from 'meteor/modweb:roles';
import { Instances } from '../imports/api/instances/instances.collection';
import { Credentials } from '../imports/api/credentials';
import { Endpoints } from '../imports/api/endpoints/endpoints.collection';
import { GlobalSettings } from '../imports/api/globalSettings/globalSettings.collection';
import { Projects } from '../imports/api/project/project.collection';

/* globals Migrations */

Migrations.add({
    version: 1,
    up: () => {
        Instances.find()
            .fetch()
            .forEach((i) => {
                if (!i.type) Instances.update({ _id: i._id }, { $set: { type: ['nlu'] } });
            });
        Meteor.users
            .find()
            .fetch()
            .forEach((u) => {
                const { roles } = u;
                const isAdmin = !!roles.find(r => r._id === 'admin');
                if (isAdmin) {
                    Roles.removeUsersFromRoles(u._id, 'admin');
                    Roles.addUsersToRoles(u._id, 'global-admin');
                }
            });
    },
});

Migrations.add({
    version: 2,
    up: () => {
        Credentials.find({ environment: { $exists: false } })
            .fetch()
            .forEach((i) => {
                Credentials.update(
                    { _id: i._id },
                    { $set: { environment: 'development' } },
                );
            });
        Endpoints.find({ environment: { $exists: false } })
            .fetch()
            .forEach((i) => {
                Endpoints.update(
                    { _id: i._id },
                    { $set: { environment: 'development' } },
                );
            });
    },
});

Migrations.add({
    // Its version 2 on CE
    version: 3,
    // add default default domain to global settings, and update projects to have this default domain
    up: () => {
        let spec = process.env.ORCHESTRATOR ? `.${process.env.ORCHESTRATOR}` : '.docker-compose';
        if (process.env.NODE_ENV === 'development') spec = `${spec}.dev`;
        if (process.env.NODE_ENV === 'test') spec = `${spec}.ci`;
        let globalSettings;
        
        try {
            globalSettings = JSON.parse(Assets.getText(`default-settings${spec}.json`));
        } catch (e) {
            globalSettings = JSON.parse(Assets.getText('default-settings.json'));
        }
        const { defaultDefaultDomain } = globalSettings.settings.private;

        GlobalSettings.update({ _id: 'SETTINGS' }, { $set: { 'settings.private.defaultDefaultDomain': defaultDefaultDomain } });

        Projects.find().fetch()
            .forEach((i) => {
                Projects.update({ _id: i._id }, { $set: { defaultDomain: { content: defaultDefaultDomain } } });
            });
    },
});

Meteor.startup(() => {
    Migrations.migrateTo('latest');
});
