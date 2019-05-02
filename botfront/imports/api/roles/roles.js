import { Roles } from 'meteor/modweb:roles';

export const can = (permission, projectId, userId) => Roles.userIsInRole(userId || Meteor.userId(), permission, projectId);

export const checkIfCan = (permission, projectId, userId) => {
    if (!can(permission, projectId, userId)) throw new Meteor.Error('401', 'Not Authorized');
};

if (Meteor.isServer) {
    export const setUpRoles = () => {
        const ue = { unlessExists: true };
        Roles.createRole('nlu-data:r', ue);
        Roles.createRole('nlu-data:w', ue);
        Roles.addRolesToParent('nlu-data:r', 'nlu-data:w');
    
        Roles.createRole('nlu-meta:r', ue);
        Roles.createRole('nlu-meta:w', ue);
        Roles.addRolesToParent('nlu-meta:r', 'nlu-meta:w');
    
        Roles.createRole('nlu-config:r', ue);
        Roles.createRole('nlu-config:w', ue);
        Roles.addRolesToParent('nlu-config:r', 'nlu-config:w');
    
        Roles.createRole('nlu-model:r', ue);
        Roles.createRole('nlu-model:w', ue);
        Roles.addRolesToParent('nlu-model:r', 'nlu-model:w');
    
        Roles.createRole('nlu-model:x', ue);
    
        Roles.createRole('nlu-viewer', ue);
        Roles.addRolesToParent(['nlu-data:r', 'nlu-model:r', 'nlu-meta:r', 'nlu-config:r'], 'nlu-viewer');
    
        Roles.createRole('nlu-editor', ue);
        Roles.addRolesToParent(['nlu-data:w', 'nlu-model:x', 'nlu-config:w', 'nlu-meta:r'], 'nlu-editor');
    
        Roles.createRole('nlu-admin', ue);
        Roles.addRolesToParent(['nlu-editor', 'nlu-meta:w', 'nlu-model:w'], 'nlu-admin');
    
        Roles.createRole('responses:r', ue);
        Roles.createRole('responses:w', ue);
        Roles.addRolesToParent('responses:r', 'responses:w');
    
        Roles.createRole('copy-viewer', ue);
        Roles.addRolesToParent('responses:r', 'copy-viewer');
    
        Roles.createRole('copy-editor', ue);
        Roles.addRolesToParent('responses:w', 'copy-editor');
    
        Roles.createRole('conversations:r', ue);
        Roles.createRole('conversations-viewer', ue);
        Roles.addRolesToParent('conversations:r', 'conversations-viewer');
    
        Roles.createRole('project-settings:r', ue);
        Roles.createRole('project-settings:w', ue);
        Roles.addRolesToParent('project-settings:r', 'project-settings:w');
        
        Roles.createRole('project-viewer', ue);
        Roles.addRolesToParent(['nlu-viewer', 'copy-viewer', 'conversations-viewer', 'project-settings:r'], 'project-viewer');
    
        Roles.createRole('project-admin', ue);
        Roles.addRolesToParent(['nlu-admin', 'copy-editor', 'conversations-viewer', 'project-settings:w', 'project-viewer'], 'project-admin');
    
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
