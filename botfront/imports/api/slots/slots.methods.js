import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Slots } from './slots.collection';
import { checkIfCan } from '../../lib/scopes';
import { slotSchemas } from './slots.schema';

function validateSchema(slot) {
    if (slot.type) {
        slotSchemas[slot.type].validate(slot, { check });
    } else {
        throw new Meteor.Error('400');
    }
}

Meteor.methods({
    'slots.insert'(slot, projectId) {
        check(slot, Object);
        check(projectId, String);
        checkIfCan('stories:w', projectId);
        validateSchema(slot);
        return Slots.insert(slot);
    },

    'slots.update'(slot, projectId) {
        check(slot, Object);
        check(projectId, String);
        checkIfCan('stories:w', projectId);
        validateSchema(slot);
        return Slots.update({ _id: slot._id }, { $set: slot });
    },

    'slots.delete'(slot, projectId) {
        check(slot, Object);
        check(projectId, String);
        checkIfCan('stories:w', projectId);
        validateSchema(slot);
        return Slots.remove(slot);
    },
});
