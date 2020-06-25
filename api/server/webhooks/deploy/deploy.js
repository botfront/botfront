const { body, validationResult } = require('express-validator/check');

const fs = require('fs');
const tar = require('tar');
const { safeLoad, safeDump } = require('js-yaml');
const { get } = require('lodash')
const { copyFilesGcs, getImagesBucket, getModelsBucket, removeFilesOfEnvExceptLatest, uploadModelToGcs } = require('../../utils');
const rimraf = require('rimraf');
const { restartRasaByEnv } = require('../restartRasa/restartRasa')


exports.deployModelValidator = [
    body('projectId', 'projectId should be a string').isString(),
    body('namespace', 'namespace should be a string').isString(),
    body('environment', 'namespace should be a string').isString(),
];


const convertUrl = function (url, deploymentFolderName) {
    return url
        .replace('development', deploymentFolderName)
        /* we need to remove the generation number, it indicate a specific version of the file
         and since we have moved the development files to a stating or production folder it has changed
         the genreation number is not important since we only have 1 version of a file in a deployment folder */
        .replace(/(?<=(\?|&))generation=[0-9]+/, '') //match the generation number any where in the query string ( with & or ? before) and remove it
}

const extractModel = function (filename, extractPath, data) {
    try {
        fs.writeFileSync(filename, data, 'base64')
        // create a folder to extract  the archive to
        fs.mkdirSync(extractPath, { recursive: true })
        /* we need to extract the whole archive and not only the domain file
    because after updating the domain file you cannot append it to a compressed archive */
        tar.x({ cwd: extractPath, file: filename, sync: true })
    } catch (e) {
        console.log(e)
        throw new Error('failed while extracting the model file')
    }
}


const modifyResponsesImagesUrls = function (responses, deploymentFolderName) {
    try {
        const responsesKeys = Object.keys(responses)
        let updatedResponses = {}
        responsesKeys.forEach((key) => {
            const variations = responses[key]
            const newVariations = variations.map((response) => {
                if (response.image !== undefined) {
                    const newUrl = convertUrl(response.image, deploymentFolderName)
                    return { ...response, image: newUrl }
                }
                return response
            })

            updatedResponses[key] = newVariations
        })
        return updatedResponses
    } catch (e) {
        console.log(e)
        throw new Error('failed when updating response images in the domain')
    }
}

exports.modifyResponsesImagesUrls = modifyResponsesImagesUrls

const saveDomainAndCreateModelArchive = function (newDomain, extractPath, modifiedPath) {
    try {
        fs.writeFileSync(`${extractPath}/core/domain.yml`, safeDump(newDomain), 'utf8')
        tar.c({ file: modifiedPath, cwd: extractPath, gzip: true, sync: true }, ['./'])
    } catch (e) {
        console.log(e)
        throw new Error('failed when compressing the model')
    }
}

const cleanFiles = function (modelFile, extractFolder, modifiedModel) {
    fs.access(modelFile, error => {
        if (!error) {
            fs.unlink(modelFile, function (e) { if (e !== null) throw new Error(e) })
        }
    });
    fs.access(modifiedModel, error => {
        if (!error) {
            fs.unlink(modifiedModel, function (e) { if (e !== null) throw new Error(e) })
        }
    });

    rimraf(extractFolder, function (e) { if (e !== null) throw new Error(e) })
}

exports.deployModel = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ error: errors.array() });
    const { projectId, namespace, environment, data, mimeType } = req.body;
    if (mimeType !== 'application/x-tar') return res.status(422).json({ message: 'Bad mimetype' });

    const { bucket: imagesBucket, error: imagesError, status: imagesStatus } = await getImagesBucket(projectId, req)
    const { bucket: modelsBucket, error: modelsError, status: modelsStatus } = await getModelsBucket(projectId, req)

    if (imagesError) return res.status(imagesStatus).json({ message: imagesError });
    if (modelsError) return res.status(modelsStatus).json({ message: modelsError });

    const name = `${projectId}-${namespace}-${environment}`
    const filename = `/tmp/trained-model-${name}.tar.gz`;
    const extractPath = `/tmp/extract_model-${name}`
    const modifiedPath = `/tmp/model-${name}.tar.gz`
    const deploymentFolderName = `${environment}-${Date.now()}`
    let needCleanFiles = false
    try {
        extractModel(filename, extractPath, data)

        await copyFilesGcs(imagesBucket, 'development', deploymentFolderName)
        needCleanFiles = true
        const domain = safeLoad(fs.readFileSync(`${extractPath}/core/domain.yml`, 'utf8'));
        const responses = get(domain, 'responses', {})

        const updatedResponses = modifyResponsesImagesUrls(responses, deploymentFolderName)

        const newDomain = { ...domain, responses: updatedResponses }
        saveDomainAndCreateModelArchive(newDomain, extractPath, modifiedPath)

        await uploadModelToGcs(modifiedPath, modelsBucket)

        const result = await restartRasaByEnv(projectId, environment)
        if (result !== 200) {
            throw new Error('failed to restart rasa')
        }
    } catch (e) {
        console.log(e)
        if(needCleanFiles) {
            cleanFiles(filename, extractPath, modifiedPath)
            setTimeout(() => {
                removeFilesOfEnvExceptLatest(imagesBucket, environment, deploymentFolderName)
            }, 15000)
        }
        return res.status(500).json({ message: e.message });
    }

    cleanFiles(filename, extractPath, modifiedPath)
    setTimeout(() => {
        removeFilesOfEnvExceptLatest(imagesBucket, environment, deploymentFolderName)
    }, 15000)

    return res.status(200).json(null);
};
