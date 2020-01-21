const { Conversations } = require('../../models/models');
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

exports.importConversationValidator = [
    param('env', 'environement should be one of: production, staging, development').isIn([
        'production',
        'staging',
        'development',
    ]),
    param('project_id', 'projectId should be a string').isString(),
    body('conversations', 'conversations should be an array').isArray(),
    body('processNlu', 'processNlu should be an boolean').isBoolean(),
];

exports.importConversation = async function(req, res) {
    const paramsErrors = validationResult(req);
    if (!paramsErrors.isEmpty())
        return res.status(422).json({ errors: paramsErrors.array() });

    const { conversations, processNlu } = req.body;
    const { project_id: projectId, env } = req.params;
    const project = await getVerifiedProject(projectId, req);
    try {
        if (!project) throw { code: 401, error: 'unauthorized' };

        const oldestImport = await getOldestTimeStamp(env);
        const { toAdd, notValids } = createConversationsToAdd(
            conversations,
            env,
            projectId,
        );

        // add each prepared conversatin to the db, a promise all is used to ensure that all data is added before checking for errors
        await Promise.all(
            toAdd.map(async (conversation) => {
                Conversations.updateOne(
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
                        (event) => event.timestamp > oldestImport,
                        env,
                    );
            }),
        );

        //create a report of the errors, if any
        const formatsError = formatsErrorsSummary(notValids);
        //object not empty
        if (Object.keys(formatsError).length !== 0)
            return res.status(206).json(formatsError);

        return res
            .status(200)
            .json({ message: 'successfuly imported all conversations' });
    } catch (err) {
        return res.status(err.code || 500).json(err);
    }
};

const formatsErrorsSummary = function(notValids) {
    const formatsError = {};
    if (notValids && notValids.length > 0) {
        formatsError.messageConversation =
            'some conversation were not added, the field _id is missing';
        formatsError.notValids = notValids;
    }
    return formatsError;
};

// wrong name, its actually the latest
const getOldestTimeStamp = async function(env) {
    const lastestAddition = await Conversations.findOne({ env: env })
        .select('updatedAt')
        .sort('-updatedAt')
        .lean()
        .exec();
    if (lastestAddition) return Math.floor(lastestAddition.updatedAt / 1000);
    return 0;
};

exports.lastestImportValidator = [
    param('env', 'environement should be one of: production, staging, development').isIn([
        'production',
        'staging',
        'development',
    ]),
];

exports.lastestImport = async function(req, res) {
    const paramsErrors = validationResult(req);
    if (!paramsErrors.isEmpty())
        return res.status(422).json({ errors: paramsErrors.array() });

    const { project_id: projectId } = req.params;
    const { env } = req.params;
    try {
        const project = await getVerifiedProject(projectId, req);
        if (!project) throw { code: 401, error: 'unauthorized' };
        const oldest = await getOldestTimeStamp(env);
        return res.status(200).json({ timestamp: oldest });
    } catch (err) {
        return res.status(err.code || 500).json(err);
    }
};
