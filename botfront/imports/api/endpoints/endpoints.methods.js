import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { formatError } from '../../lib/utils';
import { Endpoints } from './endpoints.collection';
import { checkIfCan } from '../../lib/scopes';

export const createEndpoints = async (project) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    const orchestration = process.env.ORCHESTRATOR ? process.env.ORCHESTRATOR : 'docker-compose';
    const { getDefaultEndpoints } = await import(`./endpoints.${orchestration}`);
    const endpoints = await getDefaultEndpoints(project);
    if (endpoints) Endpoints.insert({ endpoints, projectId: project._id });
};

export const saveEndpoints = async (endpoints) => {
    try {
        if (!Meteor.isServer) throw Meteor.Error(400, 'Not Authorized');
        return Endpoints.upsert({ projectId: endpoints.projectId }, { $set: { endpoints: endpoints.endpoints } });
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
