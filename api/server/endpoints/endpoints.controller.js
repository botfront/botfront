const { getVerifiedProject } = require('../utils');
const { Endpoints } = require('../../models/models');
const yaml = require('js-yaml');

exports.getProjectEndpoints = async function(req, res) {
    const { project_id: projectId, environment } = req.params;
    const { output } = req.query;
    const query =
        !environment || environment === 'development'
            ? {
                $or: [
                    { projectId, environment: { $exists: false } },
                    { projectId, environment: 'development' },
                ],
            }
            : { projectId, environment };
    try {
        const project = await getVerifiedProject(projectId, req);
        if (!project) throw { code: 401, error: 'unauthorized' };
        const endpoints = await Endpoints.findOne(query)
            .select({ endpoints: 1 })
            .lean()
            .exec();
        if (!endpoints) throw { code: 404, error: 'not_found' };
        // if yaml query param was passed, return yaml
        if (output === 'yaml') return res.status(200).send(endpoints.endpoints);
        // else return json
        const jsonEndpoints = yaml.safeLoad(endpoints.endpoints);
        return res.status(200).json(jsonEndpoints);
    } catch (err) {
        return res.status(err.code || 500).json(err);
    }
};
