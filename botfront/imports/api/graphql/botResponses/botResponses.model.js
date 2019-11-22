import mongoose from 'mongoose';
import { languages } from '../../../lib/languages';

const { Schema } = mongoose;

export const MatchSchema = new Schema({
    nlu: {
        required: false,
        type: [{
            intent: { type: String, min: 1 },
            entities: {
                default: [],
                type: [{
                    entity: { type: String, label: 'Entity name' },
                    value: {
                        type: String,
                        required: false,
                        min: 1,
                    },
                }],
            },
        }],
    },
});

const FollowUpSchema = new Schema({
    action: { type: String, required: false },
    delay: { type: Number, default: 0, min: 0 },
});

const botResponses = new Schema({
    _id: String,
    key: {
        type: String,
        label: 'Template Key',
        match: /^(utter_)/,
        index: true,
        unique: true,
    },
    projectId: String,
    values: {
        type: [{
            lang: { type: String, enum: Object.keys(languages) },
            sequence: [{ content: { type: String } }],
        }],
        max: 5,
        min: 0,
    },
    match: { type: MatchSchema, required: false },
    followUp: { type: FollowUpSchema, required: false },
});


module.exports = mongoose.model('BotResponses', botResponses, 'botResponsess');
