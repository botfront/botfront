'use strict';
const express = require('express');

const {
    exportProject,
    exportProjectValidator,
    importProject,
} = require('./port_project');
const {
    uploadImage, deleteImage, uploadImageValidator, deleteImageValidator,
} = require('./images');
const {
    deployModel,
    deployModelValidator,
} = require('../server/webhooks/deploy/deploy');

const {
    restartRasa,
    restartRasaValidator,
} = require('../server/webhooks/restartRasa/restartRasa');

const { version } = require('../package-lock.json')

let router = express.Router();

router.get('/project/:project_id/export', exportProjectValidator, exportProject);
router.put('/project/:project_id/import', importProject);

router.post('/webhooks/image/upload', uploadImageValidator, uploadImage);
router.delete('/webhooks/image/delete', deleteImageValidator, deleteImage);

router.get('/health-check', (req, res) => res.status(200).json({ version, healthy: true }));


router.post('/webhooks/rasa-restart', restartRasaValidator, restartRasa);
router.post('/webhooks/deploy', deployModelValidator, deployModel);


module.exports = router;
