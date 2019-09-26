import { Instances } from '../imports/api/instances/instances.collection';
import { GlobalSettings } from '../imports/api/globalSettings/globalSettings.collection';
import { Projects } from '../imports/api/project/project.collection';

/* globals Migrations */

Migrations.add({
    version: 1,
    up: () => {
        Instances.find()
            .fetch()
            .forEach((i) => {
                console.log(i);
                if (!i.type) Instances.update({ _id: i._id }, { $set: { type: ['nlu'] } });
            });
    },
});

Migrations.add({
    version: 2,
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
