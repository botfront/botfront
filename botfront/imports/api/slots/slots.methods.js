import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Slots from './slots.collection';

Meteor.methods({
    'slots.insert'(slot) {
        check(slot, Object);
        Slots.simpleSchema().validate(slot, { check });
        return Slots.insert(slot);
    },

    'slots.update'(slot) {
        check(slot, Object);
        Slots.simpleSchema().validate(slot, { check });
        return Slots.update({ _id: slot._id }, { $set: slot });
    },

    'slots.delete'(slot) {
        check(slot, Object);
        Slots.simpleSchema().validate(slot, { check });
        return Slots.remove(slot);
    },
});
