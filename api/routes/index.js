'use strict';
const express = require('express');

const { getSenderEventCount, insertConversation, updateConversation } = require('./conversations');
const { importConversation, importConversationValidator, lastestImport, lastestImportValidator } = require('../server/imports/imports.controller');
const {
    exportProject,
    exportProjectValidator,
    importProject,
} = require('./port_project');

let router = express.Router();


router.get('/project/:project_id/conversations/:sender_id/:event_count', getSenderEventCount);
router.post('/project/:project_id/conversations/:sender_id/insert', insertConversation);
router.post('/project/:project_id/conversations/:sender_id/update', updateConversation);

router.get('/project/:project_id/export', exportProjectValidator, exportProject);
router.put('/project/:project_id/import', importProject);

router.get('/health-check', (req, res) => res.status(200).json());

router.post('/conversations/:project_id/environment/:env', importConversationValidator, importConversation);
router.get('/conversations/:project_id/environment/:env/latest-imported-event', lastestImportValidator, lastestImport);


module.exports = router;
