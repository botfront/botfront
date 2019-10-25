const {
    Activity,
    Conversations,
    CorePolicies,
    Instances,
    Slots,
    Stories,
    StoryGroups,
    Evaluations,
    NLUModels,
    Endpoints,
    Credentials,
    Projects,
} = require('../models/models');
const { validationResult } = require('express-validator/check');
const { getVerifiedProject } = require('../server/utils');
const uuidv4 = require('uuid/v4');
const JSZip = require('jszip');

const collectionsWithModelId = {
    activity: Activity,
    evaluations: Evaluations,
};
const collectionsWithProjectId = {
    storyGroups: StoryGroups,
    stories: Stories,
    slots: Slots,
    instances: Instances,
    endpoints: Endpoints,
    credentials: Credentials,
    corePolicies: CorePolicies,
    conversations: Conversations,
};

const collections = { ...collectionsWithModelId, ...collectionsWithProjectId };
const allCollections = { ...collections, models: NLUModels };
exports.allCollections = allCollections;

const nativizeProject = function(projectId, projectName, backup) {
    /*
        given a projectId and a backup, change all IDs of backup so as to avoid potential
        conflicts when importing to database.
    */
    const { project, ...nativizedBackup } = backup;

    // delete any metadata key (that's not a collection)
    Object.keys(nativizedBackup).forEach(col => {
        if (!Object.keys(allCollections).includes(col)) delete nativizedBackup[col];
    });

    let nlu_models = project.nlu_models;

    if ('models' in nativizedBackup) {
        const modelMapping = {};
        nativizedBackup.models.forEach(m => Object.assign(modelMapping, { [m._id]: uuidv4() })); // generate mapping from old to new id
        nlu_models = nlu_models // apply mapping to nlu_models property of project
            .filter(id => !Object.keys(modelMapping).includes(id))
            .concat(Object.values(modelMapping));

        Object.keys(collectionsWithModelId)
            .filter(col => col in nativizedBackup) // apply mapping to collections whose docs have a modelId key
            .forEach(col => {
                nativizedBackup[col] = nativizedBackup[col].map(c => ({
                    ...c,
                    modelId: modelMapping[c.modelId],
                }));
            });

        // apply mapping to NLUModels collection
        nativizedBackup.models = nativizedBackup.models.map(m => ({
            ...m,
            _id: modelMapping[m._id],
        }));
    }

    if ('storyGroups' in nativizedBackup && 'stories' in nativizedBackup) {
        const storyGroupMapping = {};
        const storyMapping = {};
        nativizedBackup.storyGroups.forEach(m =>
            Object.assign(storyGroupMapping, { [m._id]: uuidv4() }),
        );
        nativizedBackup.stories.forEach(m =>
            Object.assign(storyMapping, { [m._id]: uuidv4() }),
        )
        nativizedBackup.storyGroups = nativizedBackup.storyGroups.map(sg => ({
            ...sg,
            _id: storyGroupMapping[sg._id],
        })); // apply to storygroups
        nativizedBackup.stories = nativizedBackup.stories.map(s => ({
            ...s,
            storyGroupId: storyGroupMapping[s.storyGroupId],
            _id: storyMapping[s._id],
            ...(s.checkpoints && {
                checkpoints: s.checkpoints.map(checkpoint => [storyMapping[checkpoint[0]], ...checkpoint.slice(1)]),
            }),
        })); // apply to stories
    }

    nativizedBackup.project = { ...project, _id: projectId, name: projectName, nlu_models }; // change id of project

    Object.keys(collectionsWithProjectId)
        .filter(col => col in nativizedBackup) // change projectId of every collection whose docs refer to it
        .forEach(col => {
            nativizedBackup[col] = nativizedBackup[col].map(c => ({ ...c, projectId }));
        });

    Object.keys(nativizedBackup).forEach(col => {
        // change id of every other doc
        if (!['project', 'models', 'storyGroups', 'stories'].includes(col)) {
            nativizedBackup[col] = nativizedBackup[col].map(doc => ({ ...doc, _id: uuidv4() }));
        }
    });

    return nativizedBackup;
};

const overwriteCollection = async function(projectId, modelIds, collection, backup) {
    if (!(collection in backup)) return;
    const model =
        collection in collectionsWithModelId
            ? collectionsWithModelId[collection]
            : collectionsWithProjectId[collection];
    const filter =
        collection in collectionsWithModelId ? { modelId: { $in: modelIds } } : { projectId };
    await model.deleteMany(filter).exec();
    await model.insertMany(backup[collection]);
};

const zipFile = async (response) => {
    const zip = new JSZip();
    zip.file('backup.json', JSON.stringify(response));
    return zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
    });
}

const unzipFile = async (body) => {
    const zip = new JSZip();
    await zip.loadAsync(body);
    const data = await zip.file('backup.json')
        .async('string');
    return JSON.parse(data);
}

const gatherCollectionsForExport = async (project, models, excludedCollections) => {
    const response = { project, models };
    for (let col in collectionsWithModelId) {
        if (!excludedCollections.includes(col)) {
            response[col] = await collectionsWithModelId[col]
                .find({ modelId: { $in: project.nlu_models } })
                .lean();
        }
    }
    for (let col in collectionsWithProjectId) {
        if (!excludedCollections.includes(col)) {
            response[col] = await collectionsWithProjectId[col].find({ projectId: project._id }).lean();
        }
    }
    response.timestamp = new Date().getTime();
    return response;
}

const returnResponse = async (res, response, filename) => {
    const result = res.status(200).attachment(filename)
    if (filename.slice(-4) === 'json') return result.json(response);
    const zippedFile = await zipFile(response);
    return result.send(zippedFile);
}

exports.exportProjectValidator = [];

exports.exportProject = async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { project_id: projectId } = req.params;
    const { output = 'zip' } = req.query;
    const excludedCollections = Object.keys(req.query)
        .filter(k => ['0', 'false'].includes(req.query[k]));
    try {
        const project = await getVerifiedProject(projectId, req);
        if (!project) throw { code: 401, error: 'unauthorized' };
        const models = await NLUModels.find({ _id: { $in: project.nlu_models } }).lean();
        const response = await gatherCollectionsForExport(project, models, excludedCollections);
        
        const filename = `${project.name}-${response.timestamp}.${output === 'json' ? 'json' : 'botfront'}`;
        
        return await returnResponse(res, response, filename);
    } catch (err) {
        return res.status(500).json(err);
    }
};

const importProjectValidator = [
    [
        'Project is required',
        ({ project }) =>
            project &&
            ['_id', 'name', 'defaultLanguage', 'nlu_models', 'templates'].every(prop =>
                Object.keys(project).includes(prop),
            ),
    ],
    // [
    //     `Body is required to include ${Object.keys(allCollections).join(', ')}`,
    //     body => body && Object.keys(allCollections).every(col => Object.keys(body).includes(col)),
    // ],
]

exports.importProject = async function(req, res) {
    const { project_id: projectId } = req.params;
    const body = req.body instanceof Buffer
        ? await unzipFile(req.body)
        : req.body;
    try {
        const project = await getVerifiedProject(projectId, req);
        if (!project) throw { code: 401, error: 'unauthorized' };
        importProjectValidator.forEach(([message, validator]) => {
            if (!validator(body)) throw { code: 422, error: message };
        })
        const backup = nativizeProject(projectId, project.name, body);
        for (let col in collections) {
            await overwriteCollection(projectId, project.nlu_models, col, backup);
        }
        await NLUModels.deleteMany({ _id: { $in: project.nlu_models } }).exec();
        await Projects.deleteMany({ _id: projectId }).exec();
        await NLUModels.insertMany(backup.models);
        await Projects.insertMany([backup.project]);
        return res.status(200).send('Success');
    } catch (e) {
        console.log(e);
        return res.status(e.code || 500).json(e.error);
    }
};
