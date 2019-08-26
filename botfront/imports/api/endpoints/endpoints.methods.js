import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { formatError } from '../../lib/utils';
import { Endpoints } from './endpoints.collection';
import { checkIfCan } from '../../lib/scopes';

import { ENVIRONMENT_OPTIONS } from '../../ui/components/constants.json';

export const createEndpoints = async (project) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    const orchestration = process.env.ORCHESTRATOR ? process.env.ORCHESTRATOR : 'docker-compose';
    const { getDefaultEndpoints } = await import(`./endpoints.${orchestration}`);
    const endpoints = await getDefaultEndpoints(project);
    if (endpoints) {
        ENVIRONMENT_OPTIONS.forEach((environment) => {
            Endpoints.insert({ endpoints, projectId: project._id, environment });
        });
    }
};

export const saveEndpoints = async (endpoints) => {
    try {
        if (!Meteor.isServer) throw Meteor.Error(400, 'Not Authorized');
        return Endpoints.upsert({ projectId: endpoints.projectId, _id: endpoints._id }, { $set: { endpoints: endpoints.endpoints, environment: endpoints.environment } });
    } catch (e) {
        throw formatError(e);
    }
};

if (Meteor.isServer) {
    Meteor.methods({
        'endpoints.save'(endpoints) {
            check(endpoints, Object);
            checkIfCan('project-settings:w', endpoints.projectId);
            return saveEndpoints(endpoints);
        },
    });
}
