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
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    env: { type: String, required: false },
});
model.index({ text: 1, modelId: 1, env: 1 }, { unique: true });

module.exports = mongoose.model('Activity', model, 'activity');
