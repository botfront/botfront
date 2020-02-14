import mongoose from 'mongoose';

const { Schema } = mongoose;

if (Meteor.isServer) {
    const rolesData = new Schema({
        name: { type: String, index: { unique: true } },
        description: { type: String },
        deletable: { type: Boolean, default: false },
    });
 
    module.exports = mongoose.model('RolesData', rolesData, 'rolesData');
}
