import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { formatError } from '../../lib/utils';
import { Endpoints } from './endpoints.collection';
import { checkIfCan } from '../../lib/scopes';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';

export const createEndpoints = async (project) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    const {
        settings: { private: { defaultEndpoints: endpoints } } = {},
    } = GlobalSettings.findOne({}, { 'settings.private.defaultEndpoints': 1 });
    if (endpoints) Endpoints.insert({ endpoints, projectId: project._id });
};

if (Meteor.isServer) {
    Meteor.methods({
        'endpoints.save'(endpoints) {
            checkIfCan('resources:w', endpoints.projectId);
            check(endpoints, Object);
            try {
                const env = endpoints.environment || 'development';
                const envQuery = env !== 'development'
                    ? { environment: env }
                    : { $or: [{ environment: env }, { environment: { $exists: false } }] };
                return Endpoints.upsert(
                    { projectId: endpoints.projectId, ...envQuery },
                    { $set: { endpoints: endpoints.endpoints } },
                );
            } catch (e) {
                throw formatError(e);
            }
        },
    });
}
