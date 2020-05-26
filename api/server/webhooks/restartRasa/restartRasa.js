const { body, validationResult } = require('express-validator/check');
const https = require('https');
const axios = require('axios');
const { Projects } = require('../../../models/models');

const { K8S_API_TOKEN, K8S_BASE_URL } = process.env;

exports.restartRasaValidator = [
    body('projectId', 'projectId should be a string').isString(),
];


const restartRasaByEnv = async (projectId, environment = 'developement') => {
    const { namespace } = await Projects.findOne({ _id: projectId }).select({ namespace: 1 }).lean()
    const axiosRestartRasa = axios.create({
        baseURL: K8S_BASE_URL,
        headers: {
            'Authorization': `Bearer ${K8S_API_TOKEN}`,
            'Content-Type': 'application/strategic-merge-patch+json',
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false,
        }),

    });
    const now = new Date().toISOString();
    const url = `apis/apps/v1/namespaces/${namespace}/deployments/${namespace}-${environment}-rasa-deployment`
    const data = { 'spec': { 'template': { 'metadata': { 'annotations': { 'kubectl.kubernetes.io/restartedAt': now } } } } };
    try {
        const response = await axiosRestartRasa.patch(url, data);
        return response.status
    } catch (e) {
        return 500
    }
}

exports.restartRasaByEnv = restartRasaByEnv

exports.restartRasa = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ error: errors.array() });
    const { projectId, environment } = req.body;
    return res.status(await restartRasaByEnv(projectId, environment)).send()

};