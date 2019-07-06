import { GlobalSettings } from '../globalSettings/globalSettings.collection';

export const getDefaultEndpoints = ({ _id, namespace }) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');

    const fields = {
        'settings.private.defaultEndpoints': 1,
        'settings.private.gcpModelsBucket': 1,
        'settings.private.bfApiHost': 1,
    };

    const { settings: { private: { defaultEndpoints = '', gcpModelsBucket, bfApiHost } = {} } = {} } = GlobalSettings.findOne({}, { fields });
    return defaultEndpoints
        .replace(/{BF_API_HOST}/g, bfApiHost)
        .replace(/{GCP_MODELS_BUCKET}/g, gcpModelsBucket)
        .replace(/{BF_PROJECT_ID}/g, _id)
        .replace(/{PROJECT_NAMESPACE}/g, namespace);
};
