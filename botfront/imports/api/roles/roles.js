import { Roles } from 'meteor/alanning:roles';
import { upsertRolesData } from '../graphql/rolesData/mongo/rolesData';

export const can = (permission, projectId, userId, options) => {
    const bypassWithCI = { options };
    // Cypress code can bypass roles if the bypassWithCI is true and the CI env is set.
    if (!!bypassWithCI && (!!process.env.CI || !!process.env.DEV_MODE)) return true;
    return Roles.userIsInRole(userId || Meteor.userId(), permission, projectId);
};

export const checkIfCan = (permission, projectId, userId, options) => {
    if (!can(permission, projectId, userId, options)) throw new Meteor.Error('403', 'Forbidden');
};

const ue = { unlessExists: true };

const createRole = (name, description = 'some text') => {
    Roles.createRole(name, ue);
    upsertRolesData({ name, description, deletable: false });
};

if (Meteor.isServer) {
    export const setUpRoles = () => {
        createRole('nlu-data:r', ue);
        createRole('nlu-data:w', ue);
        Roles.addRolesToParent('nlu-data:r', 'nlu-data:w');
    
        createRole('nlu-model:r', ue);
        Roles.addRolesToParent('nlu-data:r', 'nlu-model:r');
        createRole('nlu-model:w', ue);
        Roles.addRolesToParent('nlu-model:r', 'nlu-model:w');
        
        
        createRole('nlu-viewer', ue);
        Roles.addRolesToParent(['nlu-data:r', 'nlu-model:r'], 'nlu-viewer');
        
        createRole('nlu-model:x', ue);
    
        Roles.addRolesToParent('nlu-viewer', 'nlu-model:x');

        createRole('nlu-editor', ue);
        Roles.addRolesToParent(['nlu-data:w', 'nlu-model:x'], 'nlu-editor');
    
        createRole('responses:r', ue);
        createRole('responses:w', ue);
        Roles.addRolesToParent('responses:r', 'responses:w');

        createRole('stories:r', ue);
        createRole('stories:w', ue);
        Roles.addRolesToParent('stories:r', 'stories:w');
    
        createRole('copy-viewer', ue);
        Roles.addRolesToParent(['responses:r', 'stories:r'], 'copy-viewer');
    
        createRole('copy-editor', ue);
        Roles.addRolesToParent(['responses:w', 'stories:w'], 'copy-editor');
    
        createRole('conversations:r', ue);
        createRole('conversations-viewer', ue);
        Roles.addRolesToParent('conversations:r', 'conversations-viewer');

        createRole('conversations:w', ue);
        Roles.addRolesToParent('conversations:r', 'conversations:w');
        createRole('conversations-editor', ue);
        Roles.addRolesToParent('conversations:w', 'conversations-editor');
    
        createRole('project-settings:r', ue);
        createRole('project-settings:w', ue);
        Roles.addRolesToParent('project-settings:r', 'project-settings:w');
        
        createRole('project-viewer', ue);
        Roles.addRolesToParent(['nlu-viewer', 'copy-viewer', 'conversations-viewer', 'project-settings:r'], 'project-viewer');
    

        createRole('analytics:r', ue);
        createRole('project-admin', ue);
        Roles.addRolesToParent(['nlu-editor', 'nlu-model:w', 'copy-editor', 'conversations-editor', 'project-settings:w', 'project-viewer', 'analytics:r'], 'project-admin');
    
        // Legacy owner role
        createRole('owner', ue);
        Roles.addRolesToParent('project-admin', 'owner');
        
        createRole('global-settings:r', ue);
        createRole('global-settings:w', ue);
        Roles.addRolesToParent('global-settings:r', 'global-settings:w');
    
        createRole('projects:r', ue);
        createRole('projects:w', ue);
        Roles.addRolesToParent('projects:r', 'projects:w');
    
        createRole('users:r', ue);
        createRole('users:w', ue);
        Roles.addRolesToParent('users:r', 'users:w');
    
        createRole('global-admin', ue);
        Roles.addRolesToParent(['users:w', 'projects:w', 'project-admin'], 'global-admin');
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
