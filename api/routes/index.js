'use strict';
const express = require('express');

const { importConversation, importConversationValidator, latestImport, latestImportValidator } = require('../server/imports/imports.controller');
const {
    exportProject,
    exportProjectValidator,
    importProject,
} = require('./port_project');
const {
    uploadImage, deleteImage, uploadImageValidator, deleteImageValidator,
} = require('./images');
const {
    restartRasa, restartRasaValidator,
} = require('./webhooks');
const { version } = require('../package-lock.json')

let router = express.Router();

router.get('/project/:project_id/export', exportProjectValidator, exportProject);
router.put('/project/:project_id/import', importProject);

router.post('/image/upload', uploadImageValidator, uploadImage);
router.delete('/image/delete', deleteImageValidator, deleteImage);

router.get('/health-check', (req, res) => res.status(200).json({ version, healthy: true }));

router.post('/conversations/:project_id/environment/:env', importConversationValidator, importConversation);
router.get('/conversations/:project_id/environment/:env/latest-imported-event', latestImportValidator, latestImport);

router.post('/rasa/restart', restartRasaValidator, restartRasa);

module.exports = router;
