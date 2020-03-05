import yaml from 'js-yaml';
import mongoose from 'mongoose';
import { Credentials, Endpoints } from './config.models.js';

export default {
    Query: {
        getConfig: async (_root, args) => {
            const { projectId, environment, output } = args;
            const query = !environment || environment === 'development'
                ? {
                    $or: [
                        { projectId, environment: { $exists: false } },
                        { projectId, environment: 'development' },
                    ],
                }
                : { projectId, environment };
            const endpointsFetched = await Endpoints.findOne(query)
                .select({ endpoints: 1 }).lean().exec();
            const credentialsFetched = await Credentials.findOne(query)
                .select({ credentials: 1 }).lean().exec();
            let { endpoints } = endpointsFetched;
            let { credentials } = credentialsFetched;

            // parse yaml unless yaml query param was passed
            if (output !== 'yaml') {
                endpoints = yaml.safeLoad(endpoints);
                credentials = yaml.safeLoad(credentials);
            }
            return { endpoints, credentials };
        },
        healthCheck: async () => (mongoose.connection.readyState === 1),
    },
};
