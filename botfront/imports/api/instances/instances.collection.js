import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { checkIfCan, can } from '../../lib/scopes';
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
    Instances._ensureIndex({ projectId: 1 });
    Meteor.publish('nlu_instances', function(projectId) {
        check(projectId, String);
        if (can(['nlu-data:r'], projectId, this.userId)) return Instances.find({ projectId });
        return this.ready();
    });

    Meteor.methods({
        'instance.insert'(item) {
            check(item, Object);
            checkIfCan('project-admin', item.projectId);
            return Instances.insert(item);
        },

        'instance.update'(item) {
            check(item, Object);
            checkIfCan('project-admin', item.projectId);
            return Instances.update({ _id: item._id }, { $set: item });
        },

        'instance.remove'(itemId, projectId) {
            check(itemId, String);
            check(projectId, String);
            checkIfCan('project-admin', projectId);
            return Instances.remove({ _id: itemId });
        },

        'instance.findByType'(projectId, type) {
            check(type, String);
            check(projectId, String);
            checkIfCan('project-admin', projectId);
            if (type !== 'core' && type !== 'nlu') throw new Meteor.Error('400', 'unknown type');
            return Instances.findOne({ projectId, type: { $in: [type] } });
        },
    });
}

Instances.attachSchema(InstanceSchema);
