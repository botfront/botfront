'use strict';
const express = require('express');

const {
    exportProject,
    importProject,
} = require('./port_project');
const { version } = require('../package-lock.json')

let router = express.Router();

router.get('/project/:project_id/export', exportProject);
router.put('/project/:project_id/import', importProject);

router.get('/health-check', (req, res) => res.status(200).json({ version, healthy: true }));

module.exports = router;
