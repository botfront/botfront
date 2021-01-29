import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { ProjectsSchema } from './project.schema';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';
import {
    can,
    getScopesForUser,
    checkIfCan,
    getUserScopes,
    checkIfScope,
} from '../../lib/scopes';
import { auditLogIfOnServer } from '../../lib/utils';

export const Projects = new Mongo.Collection('projects');

// Deny all client-side updates on the Projects collection
Projects.deny({
    insert() {
        return true;
    },
    update() {
        return true;
    },
    remove() {
        return true;
    },
});

const getDefaultDefaultDomain = () => {
    const fields = {
        'settings.private.defaultDefaultDomain': 1,
    };
    const { settings: { private: { defaultDefaultDomain = {} } = {} } = {} } = GlobalSettings.findOne({}, { fields }) || {};
    return defaultDefaultDomain;
};

export const createProject = (item) => {
    checkIfCan('projects:w');
    auditLogIfOnServer('Created project', {
        user: Meteor.user(),
        type: 'created',
        operation: 'project-created',
        after: { project: item },
        resType: 'project',
        resId: item.id,
    });
    return Projects.insert({
        ...item,
        defaultDomain: { content: getDefaultDefaultDomain() },
        chatWidgetSettings: {
            title: item.name,
            subtitle: 'Happy to help',
            inputTextFieldHint: 'Type your message...',
            initPayload: '/get_started',
            hideWhenNotConnected: true,
        },
    });
};

Projects.attachSchema(ProjectsSchema);

if (Meteor.isServer) {
    Meteor.publish('projects', function (projectId) {
        if (
            !getUserScopes(this.userId, [
                'nlu-data:r',
                'responses:r',
                'users:r',
                'roles:r',
                'nlu-data:x',
                'global-settings:r',
                'export:x',
                'import:x',
            ]).includes(projectId)
        ) {
            return this.ready();
        }
        check(projectId, Match.Optional(String));
        if (can('projects:r', projectId)) {
            return Projects.find({ _id: projectId });
        }
        return Projects.find(
            { _id: projectId },
            {
                fields: {
                    name: 1,
                    defaultLanguage: 1,
                    languages: 1,
                    disabled: 1,
                    updatedAt: 1,
                    instance: 1,
                    training: 1,
                    timezoneOffset: 1,
                    nluThreshold: 1,
                    enableSharing: 1,
                    ...(can('stories:r', projectId) ? { storyGroups: 1 } : {}),
                    ...(can('import:x', projectId)
                        ? {
                            defaultDomain: 1,
                            gitSettings: 1,
                        }
                        : {}),
                },
            },
        );
    });

    Meteor.publish('projects.names', function () {
        if (can('projects:r', null, this.userId)) {
            return Projects.find({}, { fields: { name: 1 } });
        }
        const projects = getUserScopes(this.userId, [
            'responses:r',
            'nlu-data:r',
            'nlu-data:x',
            'import:x',
            'export:x',
        ]);
        return Projects.find({ _id: { $in: projects } }, { fields: { name: 1 } });
    });

    Meteor.publish('project.requestedSlot', function (projectId) {
        check(projectId, String);
        if (!can('stories:r', projectId)) return this.ready();
        return Projects.find(
            { _id: projectId },
            { fields: { allowContextualQuestions: 1 } },
        );
    });

    Meteor.publish('training.status', function (projectId) {
        check(projectId, String);

        return Projects.find({ projectId }, { fields: { 'training.instanceStatus': 1 } });
    });
}
