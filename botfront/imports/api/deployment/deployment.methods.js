import { Meteor } from 'meteor/meteor';

import { Deployments } from './deployment.collection';
import { formatError } from '../../lib/utils';

export const saveDeployment = (deployment) => {
    try {
        if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
        return Deployments.upsert(
            { projectId: deployment.projectId },
            { $set: { deployment: deployment.deployment } },
        );
    } catch (e) {
        throw formatError(e);
    }
};

export const createDeployment = async (project) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    if (!process.env.ORCHESTRATOR) return;
    if (process.env.ORCHESTRATOR === 'docker-compose') return;
    try {
        const { getDefaultDeployment } = await import(`./deployment.${process.env.ORCHESTRATOR}`);
        const deployment = await getDefaultDeployment(project);
        if (deployment) {
            saveDeployment({ projectId: project._id, deployment });
        }
        return;
    } catch (e) {
        console.log(e);
    }
};
