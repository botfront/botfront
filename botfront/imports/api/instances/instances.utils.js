/* eslint-disable camelcase */
import yaml from 'js-yaml';
import axios from 'axios';
import { getAxiosError } from '../../lib/utils';
import ExampleUtils from '../../ui/components/utils/ExampleUtils';
import { Instances } from './instances.collection';

function copyAndFilter(obj) {
    const copy = JSON.parse(JSON.stringify(obj));
    delete copy._id;
    delete copy.mode;
    delete copy.min_score;
    return copy;
}

export const getTrainingDataInRasaFormat = (model, withSynonyms = true, intents = [], withGazette = true) => {
    if (!model.training_data) {
        throw Error('Property training_data of model argument is required');
    }
    // Load examples
    let common_examples = model.training_data.common_examples.map(e => ExampleUtils.stripBare(e, false));
    if (intents.length > 0) {
        // filter by intent if specified
        common_examples = common_examples.filter(e => intents.indexOf(e.intent) >= 0);
    }

    const entity_synonyms = withSynonyms && model.training_data.entity_synonyms
        ? model.training_data.entity_synonyms.map(copyAndFilter)
        : [];
    const gazette = withGazette && model.training_data.fuzzy_gazette
        ? model.training_data.fuzzy_gazette.map(copyAndFilter)
        : [];

    return { rasa_nlu_data: { common_examples, entity_synonyms, gazette } };
};

export const getConfig = (model) => {
    const config = yaml.safeLoad(model.config);
    if (!config.pipeline) {
        throw new Meteor.Error('Please set a configuration');
    }
    config.pipeline.forEach((item) => {
        if (item.name.includes('Gazette')) {
            if (model.training_data.fuzzy_gazette) {
                // eslint-disable-next-line no-param-reassign
                item.entities = model.training_data.fuzzy_gazette
                    .map(({ value, mode, min_score }) => ({ name: value, mode, min_score }));
            }
        }
    });
    config.language = model.language;
    config.pipeline.unshift({
        name: 'rasa_addons.nlu.components.language_setter.LanguageSetter',
        language: config.language,
    });
    return yaml.dump(config);
};

export const getNluModelData = async (instance, nluModels, corePolicies) => {
    const nlu = {};
    const config = {};
    try {
        const client = axios.create({
            baseURL: instance.host,
            timeout: 3 * 60 * 1000,
        });
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < nluModels.length; ++i) {
            // eslint-disable-next-line no-await-in-loop
            const { data } = await client.post('/data/convert/', {
                data: getTrainingDataInRasaFormat(nluModels[i]),
                output_format: 'md',
                language: nluModels[i].language,
            });
            nlu[nluModels[i].language] = data;
            
            config[nluModels[i].language] = `${getConfig(nluModels[i])}\n\n${corePolicies}`;
        }
        return { nlu, config };
    } catch (e) {
        throw getAxiosError(e);
    }
};

export const createInstance = async (project) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    const orchestration = process.env.ORCHESTRATOR ? process.env.ORCHESTRATOR : 'docker-compose';

    try {
        const { getDefaultInstance } = await import(`./instances.${orchestration}`);
        const instance = await getDefaultInstance(project);
        if (Array.isArray(instance)) {
            instance.forEach(inst => Instances.insert(inst));
            return;
        }
        if (instance) {
            // eslint-disable-next-line consistent-return
            return await Instances.insert(instance);
        }
    } catch (e) {
        throw new Error('Could not create default instance', e);
    }
};
