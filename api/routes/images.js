const { body, validationResult } = require('express-validator/check');
const {
    uploadFileToGcs,
    deleteFileFromGcs,
    getImagesBucket,
} = require('../server/utils');

exports.uploadImageValidator = [
    body('data', 'data should be a string').isString(),
    body('projectId', 'projectId should be a string').isString(),
    body('mimeType', 'mimeType should be a string').isString(),
    body('language', 'language should be a string').isString(),
    body('responseId', 'responseId should be a string').isString(),
];

exports.uploadImage = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ error: errors.array() });
    const { data, projectId, mimeType, language, responseId } = req.body;
    const { error, status, bucket } = await getImagesBucket(projectId, req);
    if (error) return res.status(status).json({ error });
    const fileExtension = (mimeType.match(/image\/(.*)/) || [])[1];
    if (!fileExtension) return res.status(422).json({ error: 'Bad mimetype' });

    try {
        const fs = require('fs');
        const filename = `/tmp/${responseId}-${language}.${fileExtension}`;
        fs.writeFile(filename, data, 'base64', async () => {
            try {
                const response = await uploadFileToGcs(filename, bucket);
                return res.status(200).json({ uri: response[0].metadata.mediaLink });
            } catch (err) {
                /* we should not use the status within the error,
                 as the client will get the error from gcs and that could be misleading
                 e.g with a 404 from the gcs,
                 the client will get a 404 implying that the route he is trying to use do not exist
                 the only correct one is 502: Bad Gateway or Proxy Error */
                if (err.code === 404) {
                    if (err.response && err.response.request && err.response.request.href)
                        err.message = (`${err.response.request.href} `).concat(err.message)
                }
                return res.status(502).json(err);
            }
        });
    } catch (err) {
        return res.status(500).json(err);
    }
};

exports.deleteImageValidator = [
    body('projectId', 'projectId should be a string').isString(),
    body('uri', 'uri should be a string').isString(),
];

exports.deleteImage = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ error: errors.array() });
    const { projectId, uri } = req.body;
    const { error, status, bucket } = await getImagesBucket(projectId, req);
    if (error) return res.status(status).json({ error });
    const filename = (uri.match(/.*\/(.*?)(\?|$)/) || [])[1];
    if (!filename) return res.status(422).json({ error: 'Could not parse URI' });

    try {
        const response = await deleteFileFromGcs(filename, bucket);
        return res.status(response[0].statusCode).json();
    } catch (err) {
        return res.status(err.code || 500).json(err);
    }
};
