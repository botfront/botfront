import SimpleSchema from 'simpl-schema';
import yaml from 'js-yaml';

export const EndpointsSchema = new SimpleSchema({
    endpoints: {
        type: String,
        custom() {
            try {
                yaml.safeLoad(this.value);
                return null;
            } catch (e) {
                return e.reason;
            }
        },
        optional: true,
    },

    projectId: { type: String },
    createdAt: {
        type: Date,
        optional: true,
        // autoValue: () => this.isUpdate ? this.value : new Date() //TODO find out why it's always updated
    },
    updatedAt: {
        type: Date,
        optional: true,
        autoValue: () => new Date(),
    },

}, { tracker: Tracker });
