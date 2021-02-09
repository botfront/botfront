import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;
const { Schema } = mongoose;

if (Meteor.isServer) {
    const forms = new Schema({
        _id: {
            type: String,
            default: () => String(new ObjectId()),
        },
        projectId: String,
        environment: String,
        language: { type: String, optional: true },
        results: Object,
        conversationId: String,
        userId: { type: String, optional: true },
        formName: String,
        latestInputChannel: { type: String, optional: true },
        date: {
            type: Date,
            default: Date.now,
        },
    }, { versionKey: false });
    module.exports = mongoose.model('FormResults', forms, 'form_results');
}
