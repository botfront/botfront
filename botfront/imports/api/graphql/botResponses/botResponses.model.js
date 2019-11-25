import mongoose from 'mongoose';
import { languages } from '../../../lib/languages';

const { Schema } = mongoose;

/*
const contentValidator = (content) => {
    let payload = yaml.safeLoad(content);
    if (typeof payload === 'string') payload = { text: payload };
    const schemas = [LegacyCarouselSchema, ImageSchema, QuickRepliesSchema, TextSchema, FBMButtonTemplateSchema, FBMGenericTemplateSchema, FBMListTemplateSchema, FBMHandoffTemplateSchema];
    const contexts = schemas.map(s => s.newContext());
    contexts.map(c => c.validate(payload));
    // An array like [0,1,0,0] means it's a QuickRepliesSchema
    const valid = contexts.map(c => (c.isValid() ? 1 : 0));
    // Sum over [0,0,0,0] = 0 means entry not validated against any schema
    const hasError = valid.reduce((a, b) => a + b, 0) === 0;
    if (hasError) {
        contexts.forEach((context) => {
            if (context.validationErrors()) {
                context.validationErrors().forEach((e) => {
                    e.name = `values.${vi}.sequence.${seqIndex}.${e.name}`;
                    errors.push(e);
                });
            }
        })
    }
}
*/

export const MatchSchema = new Schema({
    nlu: {
        required: false,
        type: [{
            intent: { type: String, min: 1 },
            entities: {
                default: [],
                type: [{
                    entity: String,
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


module.exports = mongoose.model('BotResponses', botResponses, 'botResponses');
