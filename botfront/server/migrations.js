import { sortBy } from 'lodash';
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

// eslint-disable-next-line import/first
import assert from 'assert';
// eslint-disable-next-line import/first
import BotResponses from '../imports/api/graphql/botResponses/botResponses.model';


const migrateResponses = () => {
    const countUtterMatches = (templateValues) => {
        const re = /utter_/g;
        return ((JSON.stringify(templateValues) || '').match(re) || []).length;
    };
    Projects.find()
        .fetch()
        .forEach((p) => {
            if (p.templates) {
                const templates = sortBy(p.templates, 'key');
                const newTemplates = [];
                const duplicates = [];
                templates.forEach((t, index) => {
                    // Delete irrelevant fields and set new _id
                    delete t.match;
                    delete t.followUp;
                    t.projectId = p._id;
                    t._id = `${t.key}-${p._id}`;
                    // Put duplicates in a separate list
                    if ((index < templates.length - 1 && t.key === templates[index + 1].key) || (index > 0 && t.key === templates[index - 1].key)) {
                        duplicates.push(t);
                    } else {
                        newTemplates.push(t);
                    }
                });
                for (let i = 0; i < duplicates.length; i += 2) {
                    // Create an array containing two duplicates with the same key
                    const duplicateValues = duplicates.slice(i, i + 2);
                    assert(Array.from(new Set(duplicateValues.map(t => t.key))).length === 1); // Make sure duplicates are real
                    // Count times /utter_/ is a match
                    const utters = duplicateValues.map(t => countUtterMatches(t.values));
                    // Find the index of the template with less /utter_/ in it. This is the value we'll keep
                    const index = utters.indexOf(Math.min(...utters));
                    // Push the template we keep in the array of valid bot responses
                    newTemplates.push(duplicateValues[index]);
                }

                // Integrity check
                assert(newTemplates.length === templates.length - duplicates.length / 2);
                assert(Array.from(new Set(newTemplates)).length === newTemplates.length);
                // Insert bot responses in new collection
                BotResponses.insertMany(newTemplates);
                // Remote bot responses from project
                Projects.update({ _id: p._id }, { $unset: { templates: '' } });
            }
        });
};

// migrateResponses();
// Migrations.add({
//     version: 3,
//     // add default default domain to global settings, and update projects to have this default domain
//     up: () => migrateResponses(),
// });

Meteor.startup(() => {
    Migrations.migrateTo('latest');
});
