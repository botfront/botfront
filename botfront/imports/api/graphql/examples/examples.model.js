import mongoose from 'mongoose';

const { Schema } = mongoose;
const model = new Schema({
    _id: String,
    createdAt: Date,
    updatedAt: Date,
    projectId: String,
    language: String,
    text: String,
    intent: String,
    entities: [{
        start: Number,
        end: Number,
        value: String,
        entity: String,
    }],
    metadata: { type: Object, required: false },
}, { strict: false });

module.exports = mongoose.model('Examples', model, 'examples');
