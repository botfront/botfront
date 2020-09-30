import mongoose from 'mongoose';

const { Schema } = mongoose;
const model = new Schema({
    _id: String,
    createdAt: Date,
    updatedAt: Date,
    projectId: String,
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

model.index({ text: 1, projectId: 1, 'metadata.language': 1 }, { unique: true });

module.exports = mongoose.model('Examples', model, 'examples');
