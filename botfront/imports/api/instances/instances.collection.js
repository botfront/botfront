import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';
import { InstanceSchema } from './instances.schema';

export const Instances = new Mongo.Collection('nlu_instances');

Instances.deny({
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

if (Meteor.isServer) {
    import { auditLog } from '../../../server/logger';

    Instances._ensureIndex({ projectId: 1 });
    Meteor.publish('nlu_instances', function(projectId) {
        checkIfCan(['nlu-data:r', 'projects:r', 'responses:r'], projectId);
        check(projectId, String);
        return Instances.find({ projectId });
    });

    Meteor.methods({
        'instance.update'(item) {
            checkIfCan('projects:w', item.projectId);
            check(item, Object);
            const instanceBefore = Instances.findOne({ _id: item._id });
            auditLog('Updating instance', {
                user: Meteor.user(),
                type: 'update',
                projectId: item.projectId,
                operation: 'project-settings-update',
                resId: item.projectId,
                before: { instance: instanceBefore },
                after: { instance: item },
            });
            return Instances.update({ _id: item._id }, { $set: item });
        },
    });
}

Instances.attachSchema(InstanceSchema);
