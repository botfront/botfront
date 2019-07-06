import SimpleSchema from 'simpl-schema';

export const DeploymentSchema = new SimpleSchema({
    deployment: Object,
    'deployment.namespace': { type: String, regEx: /^[a-z0-9-_]+$/, optional: true },
    'deployment.domain': { type: String, regEx: /(?:\w+\.)+\w+/, optional: true },
    'deployment.config': { type: Object, optional: true },
    'deployment.config.bf_url': { type: String, optional: true },
    'deployment.config.bf_api_key': { type: String, optional: true },
    'deployment.config.bf_project_id': { type: String, optional: true },
    'deployment.config.gcp_models_bucket': { type: String, regEx: /^[a-z0-9-_]+$/, optional: true },
    'deployment.config.debug': { type: Boolean, defaultValue: false, optional: true },
    'deployment.images': { type: Object, optional: true },
    'deployment.images.core': { type: String, optional: true },
    'deployment.images.nlu': { type: String, optional: true },
    'deployment.images.actions': { type: String, optional: true },
    'deployment.images.webchat': { type: String, optional: true },
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
