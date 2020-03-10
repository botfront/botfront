import SimpleSchema from 'simpl-schema';
import mongoose from 'mongoose';

const { Schema } = mongoose;

// IF YOU CHANGE A SCHEMA MAKE SURE TO CHANGE BOTH !
const rolesDataSimpleSchema = new SimpleSchema({
    name: {
        type: String,
        custom() {
            return !this.value.match(/^[^:]+$/) ? 'colon' : null;
        },
    },
    description: String,
    deletable: Boolean,
});

rolesDataSimpleSchema.messageBox.messages({
    en: {
        colon: 'Colon are reserved for internal roles',
    },
});

export { rolesDataSimpleSchema };

if (Meteor.isServer) {
    // IF YOU CHANGE A SCHEMA MAKE SURE TO CHANGE BOTH !
    const rolesData = new Schema({
        name: { type: String, index: { unique: true } },
        description: { type: String },
        deletable: { type: Boolean, default: false },
    });
    module.exports = mongoose.model('RolesData', rolesData, 'rolesData');
}
