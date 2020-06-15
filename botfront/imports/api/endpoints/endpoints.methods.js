import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
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
            checkIfCan('projects:w', endpoints.projectId);
            check(endpoints, Object);
            const endpointsBefore = Endpoints.findOne({ projectId: endpoints.projectId, _id: endpoints._id });
            auditLog('Saved endpoints', {
                user: Meteor.user(),
                projectId: endpoints.projectId,
                type: 'updated',
                operation: 'project-updated',
                resId: endpoints.projectId,
                after: { endpoints },
                before: { endpoints: endpointsBefore },
                resType: 'project',
            });
            return saveEndpoints(endpoints);
        },
    });
}
