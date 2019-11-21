import mongoose from 'mongoose';

const { Schema } = mongoose;
const model = new Schema({
    _id: String,
    modelId: String,
    text: String,
    intent: { type: String, required: false },
    entities: [{
        start: Number,
        end: Number,
        value: String,
        entity: String,
        confidence: { type: Number, required: false },
        extractor: { type: String, required: false },
        processors: { type: [String], required: false },
    }],
    confidence: { type: Number, required: false },
    validated: { type: Boolean, required: false },
    createdAt: {
        type: Date,
        required: false,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    message_id: {
        type: String,
        required: false,
    },
    conversation_id: {
        type: String,
        required: false,
    },
});

module.exports = mongoose.model('Activity', model, 'activity');
