import { Instances } from './instances.collection';

export const createInstance = async (project) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    if (!process.env.ORCHESTRATOR) return;

    try {
        const { getDefaultInstance } = await import(`./instances.${process.env.ORCHESTRATOR}`);
        const instance = await getDefaultInstance(project);
        if (Array.isArray(instance)) {
            instance.forEach(inst => Instances.insert(inst));
            return;
        }
        if (instance) {
            Instances.insert(instance);
        }
    } catch (e) {
        throw new Error('Could not create default instance', e);
    }
};
