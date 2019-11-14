import SimpleSchema from 'simpl-schema';

export const DeploymentSchema = new SimpleSchema({
    deployment: Object,
    'deployment.config': { type: Object, optional: true },
    'deployment.config.gcp_models_bucket': { type: String, regEx: /^[a-z0-9-_]+$/, optional: true },
    projectId: { type: String },
    createdAt: {
        type: Date,
        defaultValue: new Date(),
    },
    updatedAt: {
        type: Date,
        optional: true,
        autoValue: () => new Date(),
    },

}, { tracker: Tracker });
