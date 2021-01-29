import { Roles } from 'meteor/alanning:roles';
import { upsertRolesData } from '../graphql/rolesData/mongo/rolesData';
import { Projects } from '../project/project.collection';

export const can = (permission, projectId, userId, options = {}) => {
    const { bypassWithCI } = options;
    if (Meteor.isTest === true) {
        Meteor.userId = () => 'testuserid';
    }
    // Cypress code can bypass roles if the bypassWithCI is true and the CI env is set.
    if (!!bypassWithCI && (Meteor.isTest || !!process.env.CI || !!process.env.DEV_MODE)) return true;
    return Roles.userIsInRole(userId || Meteor.userId(), permission, projectId);
};

export const checkIfCan = (permission, projectId, userId = null, options = {}) => {
    const could = can(permission, projectId, userId, options);
    // setting backupPlan to true throws no error, returns false
    if (could || options.backupPlan) return could;
    const trace = ((new Error()).stack.split('\n')[2] || '').trim();
    const message = `${permission} required ${trace}.`;
    if (Meteor.isServer) {
        import { getAppLoggerForFile, getAppLoggerForMethod } from '../../../server/logger';
    
        const logger = getAppLoggerForFile(__filename);
        const appMethodLogger = getAppLoggerForMethod(
            logger, 'checkIfCan', userId || Meteor.userId(), { projectId },
        );
        appMethodLogger.error(`Insufficient permissions: ${message}`);
    }
    throw new Meteor.Error('403', message);
};

export const getUserScopes = (userId, rolesFilter) => {
    const userRoles = Meteor.roleAssignment.find({ user: { _id: userId || Meteor.userId() } }, { fields: { scope: 1, inheritedRoles: 1 } }).fetch();
    let activeScopes = [];
    if (rolesFilter) {
        activeScopes = userRoles
            .filter(scopeRoles => scopeRoles.inheritedRoles && scopeRoles.inheritedRoles.some(({ _id: roleId }) => rolesFilter === roleId || rolesFilter.includes(roleId)))
            .map(({ scope }) => scope);
    } else {
        activeScopes = userRoles.map(({ scope }) => scope);
    }
    if (activeScopes.some(v => v == null)) {
        activeScopes = [...Projects.find({}, { fields: { _id: 1 } }).fetch().map(({ _id }) => _id), null];
    }
    return activeScopes;
};

export const isUserPermissionGlobal = (userId, permission) => {
    const userRoles = Meteor.roleAssignment.find({ user: { _id: userId || Meteor.userId() } }, { fields: { scope: 1, inheritedRoles: 1 } }).fetch();
    const userRolesWithSpecifiedPermission = userRoles.filter(scopeRoles => scopeRoles.inheritedRoles.some(({ _id: roleId }) => permission === roleId || permission.includes(roleId)));
    return userRolesWithSpecifiedPermission.some(({ scope }) => scope === null); // if the scope is null it correspond to the global scope
};

export const checkIfScope = (projectId, rolesFilter, userId) => {
    if (getUserScopes(userId || Meteor.userId(), rolesFilter).includes(projectId)) return;
    const trace = ((new Error()).stack.split('\n')[2] || '').trim();
    const message = `unable to access ${projectId} as ${Array.isArray(rolesFilter) ? rolesFilter.join() : rolesFilter} ${trace}`;
    throw new Meteor.Error('403', message);
};

const ue = { unlessExists: true };

const createRole = (name, description = 'some text') => {
    Roles.createRole(name, ue);
    upsertRolesData({ name, description, deletable: false });
};

if (Meteor.isServer) {
    export const setUpRoles = () => {
        createRole('nlu-data:r', 'Can read NLU data.');
        createRole('nlu-data:w', 'Can write NLU data. Extends nlu-data:r');
        Roles.addRolesToParent('nlu-data:r', 'nlu-data:w');

        createRole('nlu-data:x', 'Can train a model.');
    
        createRole('responses:r', 'Can read bot responses.');
        createRole('responses:w', 'Can create, delete and edit bot responses. Extends responses:r.');
        Roles.addRolesToParent('responses:r', 'responses:w');

        createRole('stories:r', 'Can read story content. Extends `nlu-data:r`, `responses:r`');
        Roles.addRolesToParent(['responses:r', 'nlu-data:r'], 'stories:r');
        createRole('stories:w', 'Can create, delete and edit stories. Extends `stories:r`');
        Roles.addRolesToParent(['stories:r'], 'stories:w');

        createRole('triggers:r', 'Can access story triggers. Extends `stories:r`');
        Roles.addRolesToParent('stories:r', 'triggers:r');
        createRole('triggers:w', 'Can add, edit, or delete story triggers. Extends `triggers:r`.');
        Roles.addRolesToParent('triggers:r', 'triggers:w');

        createRole('incoming:r', 'Can read incoming data. Extends `stories:r`.');
        Roles.addRolesToParent('stories:r', 'incoming:r');
        createRole('incoming:w', 'Can process incoming data. Extends `nlu-data:w`, `incoming:r`');
        Roles.addRolesToParent(['incoming:r', 'nlu-data:w'], 'incoming:w');

        createRole('analytics:r', 'Can read analytics data. Extends `incoming:r`');
        Roles.addRolesToParent('incoming:r', 'analytics:r');
        createRole('analytics:w', 'Can edit analytics dashboards. Extends `analytics:r`');
        Roles.addRolesToParent('analytics:r', 'analytics:w');


        createRole('git-credentials:r', 'Can access git credentials informations');
        createRole('git-credentials:w', 'Can access and edit git credentials informations. extends `git-credentials:r`');
        Roles.addRolesToParent(['git-credentials:r'], 'git-credentials:w');
        
        createRole('export:x', 'Can export project data');
        createRole('projects:r', 'Can read and export everything in a project and access a project settings.');
        Roles.addRolesToParent(['incoming:r', 'triggers:r', 'stories:r', 'responses:r', 'nlu-data:r', 'analytics:r', 'export:x', 'git-credentials:r'], 'projects:r');
        
        createRole('import:x', 'Can import and overwrite project data.`');
        createRole('share:x', 'Can enable and disable the share chatbot link');
        createRole(
            'projects:w',
            'Can edit, use, import, and export all resources related to a project, settings. Extends `projects:r`, `import:x`. If no `projectId` constraint is specified this permission allows adding, editing, and removing projects.',
        );
        Roles.addRolesToParent(['projects:r', 'nlu-data:x', 'analytics:w', 'incoming:w', 'triggers:w', 'stories:w', 'responses:w', 'nlu-data:w', 'import:x', 'share:x', 'git-credentials:w'], 'projects:w');

        createRole('resources:r', 'Can access project deployment environment, instance, and endpoint settings. Extends projects:r');
        Roles.addRolesToParent('projects:r', 'resources:r');
        createRole('resources:w', 'Can access and edit project deployment environment, instance, and endpoint settings. extends `projects:w`, `resources:r`');
        Roles.addRolesToParent(['projects:w', 'resources:r'], 'resources:w');


        createRole('global-settings:r', 'Can access global settings.');
        createRole('global-settings:w', 'Can edit global settings. Extends `global-settings:r.`');
        Roles.addRolesToParent('global-settings:r', 'global-settings:w');

        createRole('roles:r', 'Can view roles');
        createRole('roles:w', 'Can add, edit, and remove roles. Extends `roles:r`');
        Roles.addRolesToParent('roles:r', 'roles:w');
    
        createRole('users:r', 'Can access user information. Extends `roles:r`');
        Roles.addRolesToParent(['roles:r'], 'users:r');
        createRole('users:w', 'Can add, edit, or remove user details and roles. Extends `users:r`');
        Roles.addRolesToParent(['users:r'], 'users:w');

        createRole('project-admin', 'Can access and edit all resources of a project. Extends `projects:w`, `users:w`  ');
        Roles.addRolesToParent(['projects:w', 'users:w'], 'project-admin');
        createRole('global-admin', 'Can access and edit all resources of all projects and edit global settigs. Extends All permissions ');
        Roles.addRolesToParent(['project-admin', 'roles:w', 'global-settings:w', 'resources:w'], 'global-admin');
    };

    Meteor.startup(function() {
        setUpRoles();
    });

    // eslint-disable-next-line consistent-return
    export const publishRoles = (context) => { // exported for testing
        if (context.userId) {
            if (can(['roles:r', 'users:r'], { anyScope: true })) {
                return Meteor.roleAssignment.find({});
            }
            return Meteor.roleAssignment.find({ 'user._id': context.userId });
        }
        context.ready();
    };
    Meteor.publish(null, function () {
        return publishRoles(this);
    });
}
