import { Meteor } from 'meteor/meteor';
import yaml from 'js-yaml';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';

export const getDefaultDeployment = ({ _id, namespace, apiKey }) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    const fields = {
        'settings.private.bfApiHost': 1,
        'settings.private.defaultDeployment': 1,
        'settings.private.gcpModelsBucket': 1,
        'settings.private.dockerRegistry': 1,
        'settings.private.imagesTag': 1,
    };

    const {
        settings: {
            private: {
                defaultDeployment,
                gcpModelsBucket,
                dockerRegistry,
                imagesTag,
                bfApiHost,
            },
        },
    } = GlobalSettings.findOne({}, { fields });

    let deployment = defaultDeployment || '';

    deployment = deployment.replace(/{BF_API_KEY}/g, apiKey);
    deployment = deployment.replace(/{BF_API_HOST}/g, bfApiHost);
    deployment = deployment.replace(/{GCP_MODELS_BUCKET}/g, gcpModelsBucket);
    deployment = deployment.replace(/{BF_PROJECT_ID}/g, _id);
    deployment = deployment.replace(/{PROJECT_NAMESPACE}/g, namespace);
    deployment = deployment.replace(/{DOCKER_REGISTRY}/g, dockerRegistry);
    deployment = deployment.replace(/{IMAGES_TAG}/g, imagesTag);
    return yaml.safeLoad(deployment);
};
