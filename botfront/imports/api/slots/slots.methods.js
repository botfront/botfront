import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Slots } from './slots.collection';
import { checkIfCan } from '../../lib/scopes';
import { SlotsSchema } from './slots.schema';

Meteor.methods({
    'slots.insert'(slot, projectId) {
        check(slot, Object);
        check(projectId, String);
        checkIfCan('stories:w', projectId);
        Slots.simpleSchema().validate(slot, { check });
        return Slots.insert(slot);
    },

    'slots.update'(slot, projectId) {
        check(slot, Object);
        check(projectId, String);
        checkIfCan('stories:w', projectId);
        SlotsSchema.validate(slot, { check });
        return Slots.update({ _id: slot._id }, { $set: slot });
    },

    'slots.delete'(slot, projectId) {
        check(slot, Object);
        check(projectId, String);
        checkIfCan('stories:w', projectId);
        Slots.simpleSchema().validate(slot, { check });
        return Slots.remove(slot);
    },
});
