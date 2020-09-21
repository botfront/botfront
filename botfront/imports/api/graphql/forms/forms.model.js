import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;
const { Schema } = mongoose;

const { Mixed } = mongoose.Schema.Types;

if (Meteor.isServer) {
    const forms = new Schema({
        _id: {
            type: String,
            default: () => String(new ObjectId()),
        },
        projectId: {
            type: String,
        },
        name: {
            type: String,
        },
        description: {
            type: String,
        },
        collect_in_botfront: {
            type: Boolean,
        },
        slots: {
            type: [{
                _id: false,
                name: {
                    type: String,
                },
                filling: {
                    type: [{
                        _id: false,
                        type: {
                            type: String,
                        },
                        intent: {
                            type: [String],
                        },
                        entity: {
                            type: Mixed,
                        },
                        group: {
                            type: Mixed,
                        },
                        role: {
                            type: Mixed,
                        },
                        not_intent: {
                            type: [String],
                        },
                        value: {
                            type: Mixed,
                        },
                    }],
                },
                validation: {
                    operator: {
                        type: String,
                        enum: [
                            'is_in',
                            'is_exactly',
                            'contains',
                            'starts_with',
                            'ends_with',
                            'matches',
                            'eq',
                            'gt',
                            'gte',
                            'lt',
                            'lte',
                            'email',
                        ],
                    },
                    comparatum: Mixed,
                },
                utter_on_new_valid_slot: {
                    type: Boolean,
                    default: false,
                },
            }],
        },
        isExpanded: { type: Boolean, defaultValue: true },
        pinned: { type: Boolean, defaultValue: true },
        graph_elements: { type: Mixed },
        groupId: { type: String },
    }, { versionKey: false });
    forms.index({ name: 1, projectId: 1 }, { unique: true });
    module.exports = mongoose.model('Forms', forms, 'forms');
}
