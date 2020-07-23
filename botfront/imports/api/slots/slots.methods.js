import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

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

function handleError(e) {
    if (e.code === 11000) {
        throw new Meteor.Error(400, 'Slot already exists');
    }
    throw new Meteor.Error(500, 'Server Error');
}

Meteor.methods({
    'slots.insert'(slot) {
        check(slot, Object);
        validateSchema(slot);
        try {
            return Slots.insert(slot);
        } catch (e) {
            return handleError(e);
        }
    },

    'slots.upsert'(slot, projectId) {
        check(projectId, String);
        check(slot, Match.OneOf(Object, [Object]));
        const slots = Array.isArray(slot)
            ? slot : [slot];
        slots.forEach(({ name, ...rest }) => {
            try {
                Slots.update({ name, projectId }, { name, projectId, ...rest }, { upsert: true });
            } catch (e) {
                handleError(e);
            }
        });
    },

    'slots.update'(slot) {
        check(slot, Object);
        validateSchema(slot);
        try {
            return Slots.update({ _id: slot._id }, { $set: slot });
        } catch (e) {
            return handleError(e);
        }
    },

    'slots.delete'(slot, projectId) {
        checkIfCan('stories:w', projectId);
        check(slot, Object);
        check(projectId, String);
        validateSchema(slot);
        return Slots.remove(slot);
    },
});
