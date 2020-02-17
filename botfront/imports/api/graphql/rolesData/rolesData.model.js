import SimpleSchema from 'simpl-schema';
import mongoose from 'mongoose';

const { Schema } = mongoose;

// IF YOU CHANGE A SCHEMA MAKE SURE TO CHANGE BOTH !
export const rolesDataSimpleSchema = new SimpleSchema({
    name: String,
    description: String,
    deletable: Boolean,
});

if (Meteor.isServer) {
    // IF YOU CHANGE A SCHEMA MAKE SURE TO CHANGE BOTH !
    const rolesData = new Schema({
        name: { type: String, index: { unique: true } },
        description: { type: String },
        deletable: { type: Boolean, default: false },
    });
    module.exports = mongoose.model('RolesData', rolesData, 'rolesData');
}
