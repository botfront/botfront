import yaml from 'js-yaml';
import mongoose from 'mongoose';
import { Credentials, Endpoints } from './config.models.js';

export const getCredentialsAndEndpoints = async ({ environment, projectId, output }) => {
    const query = !environment || environment === 'development'
        ? {
            $or: [
                { projectId, environment: { $exists: false } },
                { projectId, environment: 'development' },
            ],
        }
        : { projectId, environment };
    const endpointsFetched = await Endpoints.findOne(query)
        .select({ endpoints: 1, actionEndpoint: 1 })
        .lean()
        .exec();
    const credentialsFetched = await Credentials.findOne(query)
        .select({ credentials: 1 })
        .lean()
        .exec();
    if (!endpointsFetched || !credentialsFetched) {
        throw new Error(
            `No config found for project ${projectId} and environment ${
                environment || 'development'
            }.`,
        );
    }
    const { actionEndpoint } = endpointsFetched;
    let { endpoints } = endpointsFetched;
    endpoints = yaml.safeLoad(endpoints);
    if (actionEndpoint) {
        endpoints.action_endpoint = { url: actionEndpoint };
    }
    let { credentials } = credentialsFetched;
    credentials = yaml.safeLoad(credentials);

    if (output === 'yaml') {
        endpoints = yaml.safeDump(endpoints);
        credentials = yaml.safeDump(credentials);
    }
    return { endpoints, credentials };
};

export default {
    Query: {
        getConfig: async (_root, args) => {
            const { projectId, environment, output } = args;
            return getCredentialsAndEndpoints({ environment, projectId, output });
        },
        healthCheck: async () => mongoose.connection.readyState === 1,
    },
};
