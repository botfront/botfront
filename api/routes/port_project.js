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
    Responses,
} = require('../models/models');
const { validationResult } = require('express-validator/check');
const { getVerifiedProject, aggregateEvents } = require('../server/utils');
const uuidv4 = require('uuid/v4');
const JSZip = require('jszip');
const { sortBy, get: _get } = require('lodash');
const { createResponsesIndex, createStoriesIndex } = require('../server/searchIndex/searchIndexing.utils')

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
    botResponses: Responses,
};

const collections = { ...collectionsWithModelId, ...collectionsWithProjectId };
const allCollections = { ...collections, models: NLUModels };
exports.allCollections = allCollections;

const nativizeProject = function (projectId, projectName, backup) {
    /*
        given a projectId and a backup, change all IDs of backup so as to avoid potential
        conflicts when importing to database.
    */
    const { project, ...nativizedBackup } = backup;

    // delete any metadata key (that's not a collection)
    Object.keys(nativizedBackup).forEach((col) => {
        if (!Object.keys(allCollections).includes(col)) delete nativizedBackup[col];
    });

    let nlu_models = undefined;

    if ('models' in nativizedBackup) {
        nlu_models = project.nlu_models;
        const modelMapping = {};
        nativizedBackup.models.forEach((m) =>
            Object.assign(modelMapping, { [m._id]: uuidv4() }),
        ); // generate mapping from old to new id
        nlu_models = nlu_models // apply mapping to nlu_models property of project
            .filter((id) => !Object.keys(modelMapping).includes(id))
            .concat(Object.values(modelMapping));

        Object.keys(collectionsWithModelId)
            .filter((col) => col in nativizedBackup) // apply mapping to collections whose docs have a modelId key
            .forEach((col) => {
                nativizedBackup[col] = nativizedBackup[col].map((c) => ({
                    ...c,
                    modelId: modelMapping[c.modelId],
                }));
            });

        // apply mapping to NLUModels collection
        nativizedBackup.models = nativizedBackup.models.map((m) => ({
            ...m,
            _id: modelMapping[m._id],
        }));
    }

    if ('storyGroups' in nativizedBackup && 'stories' in nativizedBackup) {
        const storyGroupMapping = {};
        const storyMapping = {};
        nativizedBackup.storyGroups.forEach((m) =>
            Object.assign(storyGroupMapping, { [m._id]: uuidv4() }),
        );
        nativizedBackup.stories.forEach((m) =>
            Object.assign(storyMapping, { [m._id]: uuidv4() }),
        );
        nativizedBackup.storyGroups = nativizedBackup.storyGroups.map((sg) => ({
            ...sg,
            _id: storyGroupMapping[sg._id],
            isExpanded: sg.isExpanded || !!sg.introStory,
            children: sg.children
                ? sg.children.map(id => storyMapping[id])
                : nativizedBackup.stories.filter(s => s.storyGroupId === sg._id)
                    .map(s => storyMapping[s._id]),
        })); // apply to storygroups
        nativizedBackup.stories = nativizedBackup.stories.map((s) => ({
            ...s,
            storyGroupId: storyGroupMapping[s.storyGroupId],
            _id: storyMapping[s._id],
            ...(s.checkpoints && {
                checkpoints: s.checkpoints.map((checkpoint) => [
                    storyMapping[checkpoint[0]],
                    ...checkpoint.slice(1),
                ]),
            }),
        })); // apply to stories

        // At the top level of the story object, create an array of events in a story and its branches
        nativizedBackup.stories = nativizedBackup.stories.map(aggregateEvents);

        nativizedBackup.project = {
            ...project,
            storyGroups: project.storyGroups
                ? project.storyGroups.map(sg => storyGroupMapping[sg])
                : nativizedBackup.storyGroups.sort((a, b) => b.introStory - a.introStory)
                    .map(({ _id }) => _id),
        };
    }

    nativizedBackup.project = {
        ...nativizedBackup.project,
        _id: projectId,
        name: projectName,
        ...(nlu_models ? { nlu_models } : {}),
    }; // change id of project

    Object.keys(collectionsWithProjectId)
        .filter((col) => col in nativizedBackup) // change projectId of every collection whose docs refer to it
        .forEach((col) => {
            nativizedBackup[col] = nativizedBackup[col].map((c) => ({ ...c, projectId }));
        });

    Object.keys(nativizedBackup).forEach((col) => {
        // change id of every other doc
        if (!['project', 'models', 'storyGroups', 'stories'].includes(col)) {
            nativizedBackup[col] = nativizedBackup[col].map((doc) => ({
                ...doc,
                _id: uuidv4(),
            }));
        }
    });

    return nativizedBackup;
};

const overwriteCollection = async function (projectId, modelIds, collection, backup) {
    if (!(collection in backup)) return;
    if (collection in collectionsWithModelId && !('models' in backup)) return;
    const model =
        collection in collectionsWithModelId
            ? collectionsWithModelId[collection]
            : collectionsWithProjectId[collection];
    const filter =
        collection in collectionsWithModelId
            ? { modelId: { $in: modelIds } }
            : { projectId };
    await model.deleteMany(filter).exec();
    // if the first botresponse has an index, the backup is from a version with response indexing
    // so we do not need to index it
    if (collection === 'botResponses' && !_get(backup, 'botResponses[0].textIndex', undefined)) {
        await createResponsesIndex(projectId, backup[collection])
        return
    }
    // if the first botresponse has an index, the backup is from a version with stories indexing
    // so we do not need to index it
    if (collection === 'stories' && !_get(backup, 'stories[0].textIndex', undefined)) {
        await createStoriesIndex(projectId, backup[collection])
        return
    }
    try { // ignore duplicate index violations
        await model.insertMany(backup[collection], { ordered: false });
    } catch (e) {
        if ((e.err || e || {}).code === 11000) return;
        throw new Error(e);
    }
};

const zipFile = async (response) => {
    const zip = new JSZip();
    zip.file('backup.json', JSON.stringify(response));
    return zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
    });
};

const unzipFile = async (body) => {
    const zip = new JSZip();
    await zip.loadAsync(body);
    const data = await zip.file('backup.json').async('string');
    return JSON.parse(data);
};

const gatherCollectionsForExport = async (project, models, excludedCollections) => {
    const response = { project, models };
    delete response.project.training;
    for (let col in collectionsWithModelId) {
        if (!excludedCollections.includes(col)) {
            response[col] = await collectionsWithModelId[col]
                .find({ modelId: { $in: project.nlu_models } })
                .lean();
        }
    }
    for (let col in collectionsWithProjectId) {
        if (!excludedCollections.includes(col)) {
            response[col] = await collectionsWithProjectId[col]
                .find({ projectId: project._id })
                .lean();
        }
    }
    response.timestamp = new Date().getTime();
    return response;
};

const returnResponse = async (res, response, filename) => {
    const result = res.status(200).attachment(filename);
    if (filename.slice(-4) === 'json') return result.json(response);
    const zippedFile = await zipFile(response);
    return result.send(zippedFile);
};

exports.exportProjectValidator = [];

exports.exportProject = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { project_id: projectId } = req.params;
    const { output = 'zip', thinProject } = req.query;
    const excludedCollections = Object.keys(req.query).filter((k) =>
        ['0', 'false'].includes(req.query[k]),
    );
    const noProjectData = ['1', 'true'].includes(thinProject);
    try {
        const project = await getVerifiedProject(projectId, req);
        if (!project) throw { code: 401, error: 'unauthorized' };
        const models = await NLUModels.find({ _id: { $in: project.nlu_models } }).lean();
        const response = await gatherCollectionsForExport(
            project,
            models,
            excludedCollections,
        );
        if (noProjectData) {
            response.project = { _id: project._id }; // don't export project doc
            delete response.models;
        }

        const filename = `${project.name}-${response.timestamp}.${
            output === 'json' ? 'json' : 'botfront'
        }`;

        return await returnResponse(res, response, filename);
    } catch (err) {
        return res.status(500).json(err);
    }
};

const importProjectValidator = [
    [
        'Project is required',
        ({ project }) =>
            project && ['_id'].every((prop) => Object.keys(project).includes(prop)),
    ],
];

const countUtterMatches = (templateValues) => {
    const re = /utter_/g;
    return ((JSON.stringify(templateValues) || '').match(re) || []).length;
};

const createResponsesFromOldFormat = (oldTemplates, projectId) => {
    const templates = sortBy(oldTemplates, 'key');
    const botResponses = [];
    const duplicates = [];
    templates.forEach((t, index) => {
        // Delete irrelevant fields and set new _id
        delete t.match;
        delete t.followUp;
        t.projectId = projectId;
        // Put duplicates in a separate list
        if (
            (index < templates.length - 1 && t.key === templates[index + 1].key) ||
            (index > 0 && t.key === templates[index - 1].key)
        ) {
            duplicates.push(t);
        } else {
            botResponses.push(t);
        }
    });
    let i = 0;
    while (i < duplicates.length) {
        let numberOfOccurence = 1;
        while (
            i + numberOfOccurence < duplicates.length &&
            duplicates[i].key === duplicates[i + numberOfOccurence].key
        ) {
            numberOfOccurence += 1;
        }
        const duplicateValues = duplicates.slice(i, i + numberOfOccurence);
        if (!Array.from(new Set(duplicateValues.map((t) => t.key))).length === 1)
            throw 'Error when deduplicating botResponses, a non duplicate was picked as duplicate'; // Make sure duplicates are real
        // Count times /utter_/ is a match
        const utters = duplicateValues.map((t) => countUtterMatches(t.values));
        // Find the index of the template with less /utter_/ in it. This is the value we'll keep
        const index = utters.indexOf(Math.min(...utters));
        // Push the template we keep in the array of valid bot responses
        botResponses.push(duplicateValues[index]);
        i += numberOfOccurence;
    }

    // Integrity check
    const distinctInDuplicates = [...new Set(duplicates.map((d) => d.key))].length;
    // duplicates.length - distinctInDuplicates: give back the number of occurence of a value minus one
    // Integrity check
    if (
        !(
            botResponses.length ===
            templates.length - (duplicates.length - distinctInDuplicates)
        )
    )
        throw 'Error when deduplicating botResponses, some duplicates left';
    if (!Array.from(new Set(botResponses)).length === botResponses.length)
        throw 'Error when deduplicating botResponses, some duplicates left';
    return botResponses;
};



exports.importProject = async function (req, res) {
    const { project_id: projectId } = req.params;
    const body = req.body instanceof Buffer ? await unzipFile(req.body) : req.body;
    try {
        const project = await getVerifiedProject(projectId, req);
        if (!project) throw { code: 401, error: 'unauthorized' };
        importProjectValidator.forEach(([message, validator]) => {
            if (!validator(body)) throw { code: 422, error: message };
        });
        const backup = nativizeProject(projectId, project.name, body);
        if (backup.project.templates) {
            backup.botResponses = createResponsesFromOldFormat(
                backup.project.templates,
                projectId,
            );
            delete backup.project.templates;
        }
        delete backup.project.training;
        if (backup.project.namespace) delete backup.project.namespace; // don't overwrite namespace
        for (let col in collections) {
            await overwriteCollection(projectId, project.nlu_models, col, backup);
        }
        const overwrittenProject = { ...project, ...backup.project };
        if ('models' in backup) await NLUModels.deleteMany({ _id: { $in: project.nlu_models } }).exec();
        else overwrittenProject.nlu_models = project.nlu_models;
        await Projects.deleteMany({ _id: projectId }).exec();
        if ('models' in backup) await NLUModels.insertMany(backup.models);
        await Projects.insertMany([overwrittenProject]);
        return res.status(200).send('Success');
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
        return res.status(e.code || 500).json(e.error);
    }
};
