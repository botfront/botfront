import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Slots } from './slots.collection';
import { slotSchemas } from './slots.schema';

function validateSchema(slot) {
    if (slot.type) {
        slotSchemas[slot.type].validate(slot, { check });
    } else {
        throw new Meteor.Error('400');
    }
}

Meteor.methods({
    'slots.insert'(slot) {
        check(slot, Object);
        validateSchema(slot);
        return Slots.insert(slot);
    },

    'slots.update'(slot) {
        check(slot, Object);
        validateSchema(slot);
        return Slots.update({ _id: slot._id }, { $set: slot });
    },

    'slots.delete'(slot) {
        check(slot, Object);
        validateSchema(slot);
        return Slots.remove(slot);
    },
});
