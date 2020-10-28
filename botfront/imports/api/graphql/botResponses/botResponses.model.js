import mongoose from 'mongoose';
import { languages } from '../../../lib/languages';

const { ObjectId } = mongoose.Types;

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

if (Meteor.isServer) {
    const botResponses = new Schema({
        _id:
            {
                type: String,
                default: () => String(new ObjectId()),
            },
        key: {
            type: String,
            label: 'Template Key',
            match: /^utter_[^\s/]*$/, // match utter_ and does not include white spaces
        },
        projectId: {
            type: String,
        },
        values: {
            type: [
                {
                    _id: false,
                    lang: { type: String, enum: Object.keys(languages) },
                    sequence: [{ _id: false, content: { type: String } }],
                },
            ],
            max: 5,
            min: 0,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
        textIndex: String,
    }, { versionKey: false });
    
    botResponses.index({ key: 1, projectId: 1 }, { unique: true });
    botResponses.index({ textIndex: 'text' });
    
    module.exports = mongoose.model('BotResponses', botResponses, 'botResponses');
    
    // BotResponses.on('index', err => console.log('erreur index', err));
    // module.exports = BotResponses;
}
