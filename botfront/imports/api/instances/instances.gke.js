import { Deployments } from '../deployment/deployment.collection';

export const getDefaultInstance = ({ _id, apiKey }) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    const deployment = Deployments.findOne(
        { projectId: _id },
        { fields: { 'deployment.domain': 1 } },
    );

    if (deployment) {
        const { domain } = deployment;
        return {
            name: 'Default',
            host: `https://${domain}/nlu`,
            token: apiKey,
            adminOnly: true,
            projectId: _id,
            type: ['nlu'],
        };
    }

    return {
        name: 'Default',
        host: 'http://localhost:5005',
        token: apiKey,
        adminOnly: true,
        projectId: _id,
        type: ['nlu'],
    };
};
