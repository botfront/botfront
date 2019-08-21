import { Roles } from 'meteor/modweb:roles';

export const can = (permission, projectId, userId, options) => {
    const bypassWithCI = { options };
    // Cypress code can bypass roles if the bypassWithCI is true and the CI env is set.
    if (!!bypassWithCI && (!!process.env.CI || !!process.env.DEV_MODE)) return true;
    return Roles.userIsInRole(userId || Meteor.userId(), permission, projectId);
};

export const checkIfCan = (permission, projectId, userId, options) => {
    if (!can(permission, projectId, userId, options)) throw new Meteor.Error('403', 'Forbidden');
};

if (Meteor.isServer) {
    export const setUpRoles = () => {
        const ue = { unlessExists: true };
        Roles.createRole('nlu-data:r', ue);
        Roles.createRole('nlu-data:w', ue);
        Roles.addRolesToParent('nlu-data:r', 'nlu-data:w');
    
        Roles.createRole('nlu-model:r', ue);
        Roles.addRolesToParent('nlu-data:r', 'nlu-model:r');
        Roles.createRole('nlu-model:w', ue);
        Roles.addRolesToParent('nlu-model:r', 'nlu-model:w');
        
        
        Roles.createRole('nlu-viewer', ue);
        Roles.addRolesToParent(['nlu-data:r', 'nlu-model:r'], 'nlu-viewer');
        
        Roles.createRole('nlu-model:x', ue);
    
        Roles.addRolesToParent('nlu-viewer', 'nlu-model:x');

        Roles.createRole('nlu-editor', ue);
        Roles.addRolesToParent(['nlu-data:w', 'nlu-model:x'], 'nlu-editor');
    
        Roles.createRole('responses:r', ue);
        Roles.createRole('responses:w', ue);
        Roles.addRolesToParent('responses:r', 'responses:w');

        Roles.createRole('stories:r', ue);
        Roles.createRole('stories:w', ue);
        Roles.addRolesToParent('stories:r', 'stories:w');
    
        Roles.createRole('copy-viewer', ue);
        Roles.addRolesToParent(['responses:r', 'stories:r'], 'copy-viewer');
    
        Roles.createRole('copy-editor', ue);
        Roles.addRolesToParent(['responses:w', 'stories:w'], 'copy-editor');
    
        Roles.createRole('conversations:r', ue);
        Roles.createRole('conversations-viewer', ue);
        Roles.addRolesToParent('conversations:r', 'conversations-viewer');

        Roles.createRole('conversations:w', ue);
        Roles.addRolesToParent('conversations:r', 'conversations:w');
        Roles.createRole('conversations-editor', ue);
        Roles.addRolesToParent('conversations:w', 'conversations-editor');
    
        Roles.createRole('project-settings:r', ue);
        Roles.createRole('project-settings:w', ue);
        Roles.addRolesToParent('project-settings:r', 'project-settings:w');
        
        Roles.createRole('project-viewer', ue);
        Roles.addRolesToParent(['nlu-viewer', 'copy-viewer', 'conversations-viewer', 'project-settings:r'], 'project-viewer');
    

        Roles.createRole('analytics:r', ue);
        Roles.createRole('project-admin', ue);
        Roles.addRolesToParent(['nlu-editor', 'nlu-model:w', 'copy-editor', 'conversations-editor', 'project-settings:w', 'project-viewer', 'analytics:r'], 'project-admin');
    
        // Legacy owner role
        Roles.createRole('owner', ue);
        Roles.addRolesToParent('project-admin', 'owner');
        
        Roles.createRole('global-settings:r', ue);
        Roles.createRole('global-settings:w', ue);
        Roles.addRolesToParent('global-settings:r', 'global-settings:w');
    
        Roles.createRole('projects:r', ue);
        Roles.createRole('projects:w', ue);
        Roles.addRolesToParent('projects:r', 'projects:w');
    
        Roles.createRole('users:r', ue);
        Roles.createRole('users:w', ue);
        Roles.addRolesToParent('users:r', 'users:w');
    
        Roles.createRole('global-admin', ue);
        Roles.addRolesToParent(['users:w', 'projects:w', 'project-admin'], 'global-admin');
    };

    Meteor.startup(function() {
        setUpRoles();
    });
}
