import { GlobalSettings } from '../globalSettings/globalSettings.collection';

export const getDefaultEndpoints = ({ _id, namespace }) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');

    const fields = {
        'settings.private.defaultEndpoints': 1,
        'settings.private.gcpModelsBucket': 1,
        'settings.private.rootUrl': 1,
        'settings.private.bfApiHost': 1,
    };
    const { settings: { private: privateVars = {} } = {} } = GlobalSettings.findOne({}, { fields });
    const {
        defaultEndpoints = '', bfApiHost, rootUrl, actionsServerUrl, gcpModelsBucket,
    } = privateVars;

    return defaultEndpoints
        .replace(/{BF_API_HOST}/g, bfApiHost)
        .replace(/{GCP_MODELS_BUCKET}/g, gcpModelsBucket)
        .replace(/{BF_PROJECT_ID}/g, _id)
        .replace(/{ROOT_URL}/g, process.env.ROOT_URL || rootUrl)
        .replace(/{ACTIONS_URL}/g, process.env.ACTIONS_URL || actionsServerUrl)
        .replace(/{PROJECT_NAMESPACE}/g, namespace);
};
