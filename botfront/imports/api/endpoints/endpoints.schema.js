import SimpleSchema from 'simpl-schema';

import { validateYaml } from '../../lib/utils';

export const EndpointsSchema = new SimpleSchema({
    endpoints: {
        type: String,
        custom: validateYaml,
        optional: true,
    },
    actionEndpoint: {
        type: String, optional: true,
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
