const { Conversations, FormResults } = require('../../models/models');
const { getVerifiedProject } = require('../utils');
const { body, validationResult, param } = require('express-validator/check');
const { logUtterancesFromTracker } = require('../../server/activity/activity.controller');

const createConversationsToAdd = function(conversations, env, projectId) {
    const toAdd = [];
    const notValids = [];
    conversations.forEach((conversation) => {
        if (conversation._id !== undefined) {
            toAdd.push({
                ...conversation,
                projectId,
                env,
                updatedAt: new Date(),
                createdAt: new Date(conversation.createdAt),
            });
        } else {
            notValids.push(conversation);
        }
    });

    return { toAdd, notValids };
};

const addConversations = async ({ conversations, env, projectId, processNlu }) => {
    const { toAdd, notValids } = createConversationsToAdd(
        conversations,
        env,
        projectId,
    );
    const latestImport = await getLatestImportTimeStamp(env);

    // add each prepared conversatin to the db, a promise all is used to ensure that all data is added before checking for errors
    const result = await Promise.all(
        toAdd.map(async (conversation) => {
            const result = await Conversations.updateOne(
                { _id: conversation._id },
                conversation,
                { upsert: true },
                function(err) {
                    if (err) throw err;
                },
            );
            if (processNlu)
                await logUtterancesFromTracker(
                    projectId,
                    conversation.tracker,
                    // conversation._id,
                    (event) => event.timestamp > latestImport,
                    env,
                );
            return result;
        }),
    );
    const added = result.filter(({ ok }) => ok);
    return { failed: notValids, toAdd: toAdd.length + notValids.length, added: added.length };
}

const addFormSubmissions = async ({ submissions, env: environment, projectId }) => {
    /* Unlike the Conversations import func, this one only imports submissions
        more recent than the last found for a given env and projectId */
    let failed = [];
    const latest = await FormResults.findOne({ environment, projectId })
        .select('date').sort('-date')
        .lean().exec();
    const latestTime = latest ? new Date(latest.date) : new Date(0);
    const submissionsToHandle = submissions.filter(submission => new Date(submission.date) >= latestTime)
    const inserts = submissionsToHandle.map(({
        _id: oldId, environment: oldEnv, projectId: oldPid, ...submission
    }) => {
        const { conversationId, date } = submission;
        return FormResults.updateOne(
            { conversationId, date, environment, projectId },
            submission,
            { upsert: true },
        )
    });
    const results = await Promise.all(inserts);
    results.forEach(({ ok }, index) => {
        if (!ok) failed.push(submissionsToHandle[index])
    })
    return { failed, toAdd: submissionsToHandle.length, added: submissionsToHandle.length - failed.length };

}

exports.importConversationalDataValidator = [
    param('env', 'environement should be one of: production, staging, development').isIn([
        'production',
        'staging',
        'development',
    ]),
    param('project_id', 'projectId should be a string').isString(),
    body('conversations', 'conversations should be an array').isArray().optional(),
    body('formSubmissions', 'form submissions should be an array').isArray().optional(),
    body('processNlu', 'processNlu should be an boolean').isBoolean().optional(),
];

exports.importConversationalData = async function(req, res) {
    const paramsErrors = validationResult(req);
    if (!paramsErrors.isEmpty())
        return res.status(422).json({ errors: paramsErrors.array() });

    const { conversations = [], formSubmissions: submissions = [], processNlu = true } = req.body;
    const { project_id: projectId, env } = req.params;
    const project = await getVerifiedProject(projectId, req);
    try {
        if (!project) throw { code: 401, error: 'unauthorized' };

        let info = {};

        if (conversations.length) {
            const { failed, toAdd, added } = await addConversations({ conversations, env, projectId, processNlu });
            info.conversationFails = failed;
            info.conversationsToAdd = toAdd;
            info.conversationsAdded = added;
        }

        if (submissions.length) {
            const { failed, toAdd, added } = await addFormSubmissions({ submissions, env, projectId });
            info.submissionFails = failed;
            info.submissionsToAdd = toAdd;
            info.submissionsAdded = added;
        }

        let status = 400;
        let response = { message: 'Invalid request' }
        if (conversations.length || submissions.length) {
            status = ((info.conversationFails || []).length || (info.submissionFails || []).length)
                ? 206 : 200;
            response = { message: 'Done', ...info }
        }
        return res
            .status(status)
            .json(response);
    } catch (err) {
        return res.status(err.code || 500).json(err);
    }
};

const getLatestImportTimeStamp = async function(env) {
    const latestAddition = await Conversations.findOne({ env: env })
        .select('tracker.latest_event_time')
        .sort('-tracker.latest_event_time')
        .lean()
        .exec();
    if (latestAddition) return Math.floor(latestAddition.tracker.latest_event_time);
    return 0;
};

exports.latestImportValidator = [
    param('env', 'environment should be one of: production, staging, development').isIn([
        'production',
        'staging',
        'development',
    ]),
];

exports.latestImport = async function(req, res) {
    const paramsErrors = validationResult(req);
    if (!paramsErrors.isEmpty())
        return res.status(422).json({ errors: paramsErrors.array() });

    const { project_id: projectId } = req.params;
    const { env } = req.params;
    try {
        const project = await getVerifiedProject(projectId, req);
        if (!project) throw { code: 401, error: 'unauthorized' };
        const latest = await getLatestImportTimeStamp(env);
        return res.status(200).json({ timestamp: latest });
    } catch (err) {
        return res.status(err.code || 500).json(err);
    }
};
