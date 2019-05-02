import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { checkIfCan, can } from '../../lib/scopes';
import { DeploymentSchema } from './deployment.schema';
import { saveDeployment } from './deployment.methods';


export const Deployments = new Mongo.Collection('deployments');
// Deny all client-side updates on the Deployments collection
Deployments.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

Meteor.startup(() => {
    if (Meteor.isServer) {
        Deployments._ensureIndex({ projectId: 1, updatedAt: -1 });
    }
});

Deployments.attachSchema(DeploymentSchema);

if (Meteor.isServer) {
    Meteor.publish('deployments', function (projectId) {
        check(projectId, String);
        if (can('project-settings:r', projectId, this.userId)) return Deployments.find({ projectId });
        return this.ready();
    });

    Meteor.methods({
        'deployments.save'(deployment) {
            check(deployment, Object);
            checkIfCan('project-settings:w', deployment.projectId);
            return saveDeployment(deployment);
        },
    });
}
