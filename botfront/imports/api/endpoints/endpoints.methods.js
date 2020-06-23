import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { safeLoad, safeDump } from 'js-yaml';
import { formatError } from '../../lib/utils';
import { Endpoints } from './endpoints.collection';
import { checkIfCan } from '../../lib/scopes';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';

import { ENVIRONMENT_OPTIONS } from '../../ui/components/constants.json';

export const createEndpoints = async (project) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    const {
        settings: { private: { defaultEndpoints: endpoints } } = {},
    } = GlobalSettings.findOne({}, { 'settings.private.defaultEndpoints': 1 });
    if (endpoints) {
        ENVIRONMENT_OPTIONS.forEach(environment => Endpoints.insert({
            endpoints: endpoints
                .replace(/{GCP_MODELS_BUCKET}/g, project.modelsBucket || '<BUCKET>')
                .replace(/{PROJECT_NAMESPACE}/g, project.namespace)
                .replace(/{BF_PROJECT_ID}/g, project._id),
            projectId: project._id,
            environment,
        }));
    }
};
export const saveEndpoints = async (endpoints) => {
    try {
        if (!Meteor.isServer) throw Meteor.Error(400, 'Not Authorized');
        return Endpoints.upsert(
            { projectId: endpoints.projectId, _id: endpoints._id },
            { $set: { endpoints: endpoints.endpoints } },
        );
    } catch (e) {
        throw formatError(e);
    }
};

if (Meteor.isServer) {
    import { auditLog } from '../../../server/logger';

    Meteor.methods({
        'endpoints.save'(endpoints) {
            checkIfCan('resources:w', endpoints.projectId);
            check(endpoints, Object);
            const endpointsBefore = Endpoints.findOne({ projectId: endpoints.projectId, _id: endpoints._id });
            auditLog('Saved endpoints', {
                user: Meteor.user(),
                projectId: endpoints.projectId,
                type: 'updated',
                operation: 'endpoints-updated',
                resId: endpoints.projectId,
                after: { endpoints },
                before: { endpoints: endpointsBefore },
                resType: 'project',
            });
            return saveEndpoints(endpoints);
        },
        async 'actionsEndpoints.save'(projectId, env, actionsUrl) {
            checkIfCan('projects:w', projectId);
            check(projectId, String);
            check(env, String);
            check(actionsUrl, String);
            const oldEndpoints = Endpoints.findOne({ projectId, environment: env });
            if (!oldEndpoints) throw new Error(`${env} endpoint settings do not exist`);
            const endpoints = safeLoad(oldEndpoints.endpoints);
            endpoints.action_endpoint.url = actionsUrl;
            const update = { endpoints: safeDump(endpoints) };
            auditLog('Saved endpoints', {
                user: Meteor.user(),
                projectId,
                type: 'updated',
                operation: 'endpoints-updated',
                resId: projectId,
                after: { endpoints: { ...oldEndpoints, ...update } },
                before: { endpoints: oldEndpoints },
                resType: 'project',
            });
            return Endpoints.update({ projectId, environment: env }, { $set: update });
        },
    });
}
