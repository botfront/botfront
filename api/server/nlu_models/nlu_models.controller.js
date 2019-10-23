const { getVerifiedProject } = require('../utils');
const { NLUModels } = require('../../models/models');
const _ = require('lodash');

exports.getPublishedModels = async function(req, res) {
    const { project_id: projectId } = req.params;
    try {
        const project = await getVerifiedProject(projectId, req, {
            nlu_models: 1,
            defaultLanguage: 1,
        });
        if (!project) throw { code: 401, error: 'unauthorized' };
        const models = await NLUModels.find({ _id: { $in: project.nlu_models }, published: true })
            .select({ language: 1 })
            .lean()
            .exec();
        if (!models) throw { code: 404, error: 'not_found' };
        const response = _.chain(models)
            .keyBy('language')
            .mapValues('_id')
            .value();
        if (project.defaultLanguage) response.default_language = project.defaultLanguage;
        return res.status(200).json(response);
    } catch (err) {
        return res.status(err.code || 500).json(err);
    }
};
