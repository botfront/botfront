import mongoose from 'mongoose';

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

const model = new Schema({
    _id: {
        type: String,
        default: () => String(new ObjectId()),
    },
    name: String,
    projectId: String,
    cards: Array,
    languages: Array,
    envs: Array,
});

module.exports = mongoose.model('AnalyticsDashboards', model, 'analyticsDashboards');
