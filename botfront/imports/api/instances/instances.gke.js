import { Deployments } from '../deployment/deployment.collection';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';

export const getDefaultInstance = ({ _id, apiKey }) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    const deployment = Deployments.findOne(
        { projectId: _id },
        { fields: { 'deployment.domain': 1 } },
    );

    const settings = GlobalSettings.findOne({ _id: 'SETTINGS' }, { fields: { 'settings.private.rasaUrl': 1 } });
    const { settings: { private: { rasaUrl } } } = settings;
    
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
        host: rasaUrl || 'http://localhost:5005',
        token: apiKey,
        adminOnly: true,
        projectId: _id,
        type: ['nlu'],
    };
};
