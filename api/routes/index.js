'use strict';
const express = require('express');

const { importConversationalData, importConversationalDataValidator, latestImport, latestImportValidator } = require('../server/imports/imports.controller');
const {
    exportProject,
    exportProjectValidator,
    importProject,
} = require('./port_project');
const { version } = require('../package-lock.json')

let router = express.Router();

router.get('/project/:project_id/export', exportProjectValidator, exportProject);
router.put('/project/:project_id/import', importProject);

router.get('/health-check', (req, res) => res.status(200).json({ version, healthy: true }));

router.post('/conversations/:project_id/environment/:env', importConversationalDataValidator, importConversationalData);
router.get('/conversations/:project_id/environment/:env/latest-imported-event', latestImportValidator, latestImport);


module.exports = router;
