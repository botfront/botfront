import mongoose from 'mongoose';

const { Schema } = mongoose;
const model = new Schema({
    _id: String,
    modelId: { type: String, required: false },
    text: String,
    intent: { type: String, required: false },
    entities: [{
        start: Number,
        end: Number,
        value: String,
        group: { type: String, required: false },
        role: { type: String, required: false },
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
    language: String,
    projectId: String,
});
model.index({
    text: 1, modelId: 1, env: 1, language: 1, projectId: 1,
}, { unique: true });
model.index({
    text: 1, env: 1, language: 1, projectId: 1,
}, { unique: true });
model.index({
    modelId: 1, ooS: 1, env: 1, createdAt: -1,
});
model.index({
    modelId: 1, ooS: 1, env: 1, intent: 1, createdAt: -1,
});
module.exports = mongoose.model('Activity', model, 'activity');
