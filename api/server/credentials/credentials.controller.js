const { getVerifiedProject } = require('../utils');
const { Credentials } = require('../../models/models');
const yaml = require('js-yaml');

exports.getProjectCredentials = async function(req, res) {
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
        const credentials = await Credentials.findOne(query)
            .select({ credentials: 1 })
            .lean()
            .exec();
        if (!credentials) throw { code: 404, error: 'not_found' };
        // if yaml query param was passed, return yaml
        if (output === 'yaml') return res.status(200).send(credentials.credentials);
        // else return json
        const jsonCredentials = yaml.safeLoad(credentials.credentials);
        return res.status(200).json(jsonCredentials);
    } catch (err) {
        return res.status(err.code || 500).json(err);
    }
};
