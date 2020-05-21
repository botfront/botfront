import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { ProjectsSchema } from './project.schema';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';

export const Projects = new Mongo.Collection('projects');

// Deny all client-side updates on the Projects collection
Projects.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

const getDefaultDefaultDomain = () => {
    const fields = {
        'settings.private.defaultDefaultDomain': 1,
    };
    const { settings: { private: { defaultDefaultDomain = {} } = {} } = {} } = GlobalSettings.findOne({}, { fields }) || {};
    return defaultDefaultDomain;
};

export const createProject = item => Projects.insert({ ...item, defaultDomain: { content: getDefaultDefaultDomain() } });

Projects.attachSchema(ProjectsSchema);

Meteor.startup(() => {
    if (Meteor.isServer) {
        Projects._ensureIndex({ 'templates.key': 1 });
        Projects._ensureIndex({ apiKey: 1, _id: 1 });
        Projects._ensureIndex({ 'templates.match.nlu.intent': 1, 'templates.match.nlu.entities.entity': 1, 'templates.match.nlu.entities.value': 1 });
    }
});

if (Meteor.isServer) {
    Meteor.publish('projects', function (projectId) {
        check(projectId, Match.Optional(String));
        return Projects.find({ _id: projectId });
    });

    Meteor.publish('projects.names', function () {
        return Projects.find({}, { name: 1 });
    });

    Meteor.publish('template-keys', function (projectId) {
        check(projectId, String);
        return Projects.find({ _id: projectId },
            { fields: { 'templates.key': 1 } });
    });
}
