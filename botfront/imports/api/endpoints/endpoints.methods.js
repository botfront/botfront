import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { safeLoad, safeDump } from 'js-yaml';
import { formatError } from '../../lib/utils';
import { Endpoints } from './endpoints.collection';
import { checkIfCan } from '../../lib/scopes';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';

export const createEndpoints = async (project) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    const {
        settings: { private: { defaultEndpoints: endpointsWithActionEndpoint = '' } } = {},
    } = GlobalSettings.findOne({}, { 'settings.private.defaultEndpoints': 1 });
    let { action_endpoint: actionEndpoint = {}, ...endpoints } = safeLoad(endpointsWithActionEndpoint);
    actionEndpoint = actionEndpoint.url || '';
    endpoints = safeDump(endpoints);
    if (endpoints) Endpoints.insert({ endpoints, actionEndpoint, projectId: project._id });
};

export const saveEndpoints = async (data) => {
    try {
        if (!Meteor.isServer) throw Meteor.Error(400, 'Not Authorized');
        const {
            _id, projectId, endpoints, actionEndpoint,
        } = data;
        return Endpoints.upsert(
            { _id, projectId },
            {
                $set: {
                    ...(endpoints ? { endpoints } : {}),
                    ...(actionEndpoint ? { actionEndpoint } : {}),
                },
            },
        );
    } catch (e) {
        throw formatError(e);
    }
};

if (Meteor.isServer) {
    Meteor.methods({
        'endpoints.save'(endpoints) {
            check(endpoints, Object);
            const { projectId } = endpoints;
            checkIfCan('projects:w', projectId);
            return saveEndpoints(endpoints);
        },
        'actionEndpoint.save'(endpoints) {
            check(endpoints, Object);
            const { projectId, _id, actionEndpoint } = endpoints;
            checkIfCan('projects:w', projectId);
            return saveEndpoints({ _id, projectId, actionEndpoint });
        },
    });
}
