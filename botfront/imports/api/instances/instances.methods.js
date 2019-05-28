import axios from 'axios';
import { check } from 'meteor/check';
import { Instances } from './instances.collection';
import { getTrainingDataInRasaFormat } from '../../lib/nlu_methods';
import { NLUModels } from '../nlu_model/nlu_model.collection';
import { getAxiosError } from '../../lib/utils';

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

Meteor.methods({
    async 'rasa.train'(nluModelId, projectId, instance) {
        check(nluModelId, String);
        check(projectId, String);
        check(instance, Object);
        const publishedModels = await Meteor.callWithPromise('nlu.getPublishedModelsLanguages', projectId);
        const nluModels = NLUModels.find({ _id: { $in: publishedModels.map(m => m._id) } }, { fields: { config: 1, training_data: 1, language: 1 } }).fetch();
        const nlu = {};
        const config = {};
        const client = axios.create({
            baseURL: instance.host,
            timeout: 100 * 1000,
        });
        try {
            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < nluModels.length; ++i) {
                // eslint-disable-next-line no-await-in-loop
                const { data } = await client.post('/data/convert/', {
                    data: getTrainingDataInRasaFormat(nluModels[i]),
                    output_format: 'md',
                    language: nluModels[i].language,
                });
                nlu[nluModels[i].language] = data;
                config[nluModels[i].language] = nluModels[i].config;
            }

            const domain = 'intents:\n- basics.yes\nactions:\n- utter_yes\ntemplates:\n  utter_yes:\n  - text: "yes"';
            const stories = '## story\n* basics.yes\n- utter_yes';
            
            const payload = {
                domain,
                // domain: '',
                stories,
                // nlu,
                config,
                out: '../_project/models',
                // force: true,
            };

            console.log(JSON.stringify(payload, null, 2));
            const model = await client.post('/model/train', payload);
            // console.log(model.data)
            Meteor.call('nlu.markTrainingStopped', nluModelId, 'success');
        } catch (e) {
            Meteor.call('nlu.markTrainingStopped', nluModelId, 'failure', e.reason);
            throw getAxiosError(e);
        }
    },
});
