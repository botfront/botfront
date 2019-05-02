import SimpleSchema from 'simpl-schema';

export const DeploymentSchema = new SimpleSchema({
    deployment: Object,
    'deployment.namespace': { type: String, regEx: /^[a-z0-9-_]+$/ },
    'deployment.domain': { type: String, regEx: /(?:\w+\.)+\w+/ },
    'deployment.config': { type: Object, optional: true },
    'deployment.config.bf_url': { type: String },
    'deployment.config.bf_api_key': { type: String },
    'deployment.config.bf_project_id': { type: String },
    'deployment.config.nlu_models_bucket': { type: String, regEx: /^[a-z0-9-_]+$/ },
    'deployment.config.core_models_bucket': { type: String, regEx: /^[a-z0-9-_]+$/ },
    'deployment.config.debug': { type: Boolean, defaultValue: false },
    'deployment.images': { type: Object, optional: true },
    'deployment.images.core': { type: String },
    'deployment.images.nlu': { type: String },
    'deployment.images.actions': { type: String },
    'deployment.images.webchat': { type: String },
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
