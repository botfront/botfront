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
        checkIfCan(['nlu-data:r', 'resources:r', 'responses:r'], projectId);
        check(projectId, String);
        return Instances.find({ projectId });
    });

    Meteor.methods({
        'instance.update'(item) {
            checkIfCan('resources:w', item.projectId);
            check(item, Object);
            const instanceBefore = Instances.findOne({ _id: item._id });
            auditLog('Updated instance', {
                user: Meteor.user(),
                type: 'updated',
                projectId: item.projectId,
                operation: 'project-settings-updated',
                resId: item.projectId,
                before: { instance: instanceBefore },
                after: { instance: item },
                resType: 'project-settings',
            });
            return Instances.update({ _id: item._id }, { $set: item });
        },
    });
}

Instances.attachSchema(InstanceSchema);
