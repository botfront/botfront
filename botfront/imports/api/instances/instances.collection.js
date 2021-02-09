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
        if (can('project-admin', projectId, this.userId)) return Instances.find({ projectId });
        return this.ready();
    });

    Meteor.methods({
        'instance.update'(item) {
            check(item, Object);
            checkIfCan('project-admin', item.projectId);
            return Instances.update({ projectId: item.projectId }, { $set: item });
        },
    });
}

Instances.attachSchema(InstanceSchema);
