import { Roles } from 'meteor/alanning:roles';
import { upsertRolesData } from '../graphql/rolesData/mongo/rolesData';

export const can = (permission, projectId, userId, options) => {
    const bypassWithCI = { options };
    // Cypress code can bypass roles if the bypassWithCI is true and the CI env is set.
    if (!!bypassWithCI && (!!process.env.CI || !!process.env.DEV_MODE)) return true;
    return Roles.userIsInRole(userId || Meteor.userId(), permission, projectId);
};

export const checkIfCan = (permission, projectId, userId, options) => {
    if (!can(permission, projectId, userId, options)) throw new Meteor.Error('403', `${permission} Forbidden`);
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
    
        createRole('nlu-model:r', 'Can read NLU model data and meta information (language). Extends nlu-data:r.');
        Roles.addRolesToParent('nlu-data:r', 'nlu-model:r');
        createRole('nlu-model:w', 'Can add, edit and remove NLU data and models (add or remove languages to a project). Extends nlu-model:r, nlu-data:w.');
        Roles.addRolesToParent(['nlu-model:r', 'nlu-data:w'], 'nlu-model:w');
        createRole('nlu-model:x', 'Can train a model.');
    
        createRole('responses:r', 'Can read bot responses.');
        createRole('responses:w', 'Can create, delete and edit bot responses. Extends responses:r.');
        Roles.addRolesToParent('responses:r', 'responses:w');

        createRole('stories:r', 'Can read story content. Extends `nlu-data:r`, `nlu-model:r`');
        Roles.addRolesToParent(['responses:r', 'nlu-model:r'], 'stories:r');
        createRole('stories:w', 'Can read story content. Extends `stories:r`');
        Roles.addRolesToParent(['stories:r'], 'stories:w');

        createRole('triggers:r', 'Can access story triggers. Extends `stories:r`');
        Roles.addRolesToParent('stories:r', 'triggers:r');
        createRole('triggers:w', 'Can add, edit, or delete story triggers. Extends `triggers:r`.');
        Roles.addRolesToParent('triggers:r', 'triggers:w');

        createRole('incoming:r', 'Can read incoming data. Extends `stories:r`.');
        Roles.addRolesToParent('stories:r', 'incoming:r');
        createRole('incoming:w', 'Can process incoming data. Extends `stories:r`, `nlu-data:w`, `incoming:r`');
        Roles.addRolesToParent(['incoming:r', 'nlu-data:w'], 'incoming:w');

        createRole('analytics:r', 'Can read analytics data. Extends `incoming:r`');
        Roles.addRolesToParent('incoming:r', 'analytics:r');

        createRole('projects:r', 'Can access project settings.');
        createRole(
            'projects:w',
            'Can edit project meta information andsettings. Extends `projects:r`. If no `projectId` constraint is specified this permission allows adding, editing, and removing projects.',
        );
        Roles.addRolesToParent('projects:r', 'projects:w');
        
        createRole('global-settings:r', 'Can access global settings.');
        createRole('global-settings:w', 'Can edit global settings. Extends `global-settings:r.`');
        Roles.addRolesToParent('global-settings:r', 'global-settings:w');

        createRole('roles:r', 'Can view roles');
        createRole('roles:w', 'Can add, edit, and remove roles. Extends `roles:r`');
        Roles.addRolesToParent('roles:r', 'roles:w');
    
        createRole('users:r', 'Can access user information.');
        createRole('users:w', 'Can add, edit, or remove user details and roles. Extends `users:r`');
        Roles.addRolesToParent(['users:r', 'roles:r'], 'users:w');


        createRole('global-admin');
        Roles.addRolesToParent(['users:w', 'projects:w', 'nlu-model:w', 'nlu-model:x', 'triggers:w', 'responses:w', 'stories:w', 'roles:r', 'analytics:r', 'incoming:w'], 'global-admin');
    };

    Meteor.startup(function() {
        setUpRoles();
    });
    
    // eslint-disable-next-line consistent-return
    Meteor.publish(null, function () {
        if (this.userId) {
            return Meteor.roleAssignment.find({ 'user._id': this.userId });
        }
        this.ready();
    });
}
