import yaml from 'js-yaml';
import mongoose from 'mongoose';
import { Credentials, Endpoints, Projects } from './config.models.js';
import { getWebchatRules } from './webchatProps';

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

            const project = await Projects.findOne({ _id: projectId })
                .select({ chatWidgetSettings: 1 }).lean().exec();
            const rules = await getWebchatRules(projectId);
            let { endpoints } = endpointsFetched;
            let { credentials } = credentialsFetched;
            const { chatWidgetSettings } = project;
            const props = { ...chatWidgetSettings, rules };
            credentials = yaml.safeLoad(credentials);
            const webchatPlusInput = credentials['rasa_addons.core.channels.webchat_plus.WebchatPlusInput'];
            const webchatInput = credentials['rasa_addons.core.channels.webchat.WebchatInput'];
            const restPlusInput = credentials['rasa_addons.core.channels.rest_plus.BotfrontRestPlusInput'];
            const restInput = credentials['rasa_addons.core.channels.rest.BotfrontRestInput'];
            if (webchatInput !== undefined) {
                credentials['rasa_addons.core.channels.webchat.WebchatInput'] = { ...(webchatInput || {}), props };
            }
            if (restInput !== undefined) {
                credentials['rasa_addons.core.channels.rest.BotfrontRestInput'] = { ...(restInput || {}), props };
            }
            if (webchatPlusInput !== undefined) {
                credentials['rasa_addons.core.channels.webchat_plus.WebchatPlusInput'] = { ...(webchatPlusInput || {}), props };
            }
            if (restPlusInput !== undefined) {
                credentials['rasa_addons.core.channels.rest_plus.BotfrontRestPlusInput'] = { ...(restPlusInput || {}), props };
            }
            // parse yaml unless yaml query param was passed
            if (output !== 'yaml') {
                endpoints = yaml.safeLoad(endpoints);
                return { endpoints, credentials };
            }
            credentials = yaml.safeDump(credentials, { noRefs: true });

            return { endpoints, credentials };
        },
        healthCheck: async () => (mongoose.connection.readyState === 1),
    },
};
