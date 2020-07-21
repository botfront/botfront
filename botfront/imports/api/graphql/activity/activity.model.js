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
    env: { type: String, required: false },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    ooS: {
        type: Boolean,
        defaultValue: false,
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
model.index({ text: 1, modelId: 1, env: 1 }, { unique: true });
model.index({
    modelId: 1, ooS: 1, env: 1, createdAt: -1,
});
model.index({
    modelId: 1, ooS: 1, env: 1, intent: 1, createdAt: -1,
});
module.exports = mongoose.model('Activity', model, 'activity');
