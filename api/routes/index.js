'use strict';
const express = require('express');
const {
    getResponseByName,
    getAllResponses,
    allResponsesValidator,
    nlg,
    nlgValidator,
} = require('../server/templates/templates.controller');

const utteranceCtrl = require('../server/activity/activity.controller');
const { getSenderEventCount, insertConversation, updateConversation } = require('./conversations');
const { getProjectCredentials } = require('../server/credentials/credentials.controller');
const { getProjectEndpoints } = require('../server/endpoints/endpoints.controller');
const { getPublishedModels } = require('../server/nlu_models/nlu_models.controller');
const { importConversation, importConversationValidator, lastestImport, lastestImportValidator } = require('../server/imports/imports.controller');
const {
    exportProject,
    exportProjectValidator,
    importProject,
    importProjectValidator,
} = require('./port_project');

let router = express.Router();

/* legacy routes */
router.get('/project/:project_id/template/key/:name/lang/:lang', getResponseByName);
router.get('/project/:project_id/response/name/:name/lang/:lang', getResponseByName);
router.post('/log-utterance', utteranceCtrl.create);
/* */

router.get('/project/:project_id/responses', allResponsesValidator, getAllResponses);
router.get('/project/:project_id/templates', allResponsesValidator, getAllResponses);
router.post('/project/:project_id/nlg', nlgValidator, nlg);

router.get('/project/:project_id/conversations/:sender_id/:event_count', getSenderEventCount);
router.post('/project/:project_id/conversations/:sender_id/insert', insertConversation);
router.post('/project/:project_id/conversations/:sender_id/update', updateConversation);

router.get('/project/:project_id/credentials/:environment?/', getProjectCredentials);
router.get('/project/:project_id/endpoints/:environment?/', getProjectEndpoints);

router.get('/project/:project_id/export', exportProjectValidator, exportProject);
router.put('/project/:project_id/import', importProject);

router.get('/project/:project_id/models/published', getPublishedModels);
router.get('/health-check', (req, res) => res.status(200).json());

router.post('/conversations/:project_id/environment/:env', importConversationValidator, importConversation);
router.get('/conversations/:project_id/environment/:env/latest-imported-event', lastestImportValidator, lastestImport);


module.exports = router;
