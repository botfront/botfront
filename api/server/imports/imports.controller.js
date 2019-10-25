const {
  Conversations,
  Projects,
  NLUModels,
  Activity
} = require("../../models/models");
const { getVerifiedProject } = require("../utils");
const {
  body,
  validationResult,
  param,
  query
} = require("express-validator/check");

retreiveModelsIds = async function(projectId) {
  const { nlu_models: modelsIds } = await Projects.findOne({ _id: projectId })
    .select("nlu_models -_id")
    .lean()
    .exec();
  modelsAndLang = modelsIds.map(async modelId => {
    nluModel = NLUModels.findOne({ _id: modelId })
      .select("_id language")
      .lean()
      .exec();
    return nluModel;
  });
  return await Promise.all(modelsAndLang);
};

inferModelId = function(language, projectsAndModels) {
  const modelId = projectsAndModels.find(
    nluModel => nluModel.language === language
  );
  if (modelId) return modelId._id;
  return undefined;
};

addParseDataToActivity = async function(
  projectId,
  conversation,
  oldestImportTimestamp
) {
  const modelsOfProject = await retreiveModelsIds(projectId);
  let parseDataToAdd = [];
  let invalidParseData = [];
  conversation.tracker.events.forEach(event => {
    if (
      event.parse_data !== undefined &&
      event.parse_data.language !== undefined &&
      event.parse_data.text !== "" &&
      event.timestamp > oldestImportTimestamp
    ) {
      const { intent, entities, text } = event.parse_data;
      const modelId = inferModelId(event.parse_data.language, modelsOfProject);
      if (modelId) {
        parseDataToAdd.push({
          modelId: modelId,
          text: text,
          intent: intent.name,
          entities,
          confidence: intent.confidence,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        invalidParseData.push(event.parse_data);
      }
    }
  });
  return { parseDataToAdd, invalidParseData };
};

createConversationsToAdd = function(conversations, env, projectId) {
  const toAdd = [];
  const notValids = [];
  conversations.forEach(conversation => {
    if (conversation._id !== undefined) {
      toAdd.push({
        ...conversation,
        projectId,
        env,
        updatedAt: new Date(),
        createdAt: new Date(conversation.createdAt)
      });
    } else {
      notValids.push(conversation);
    }
  });

  return { toAdd, notValids };
};

exports.importConversationValidator = [
  param(
    "env",
    "environement should be one of: production, staging, development"
  ).isIn(["production", "staging", "development"]),
  param("project_id", "projectId should be a string").isString(),
  body("conversations", "conversations should be an array").isArray(),
  body("processNlu", "processNlu should be an boolean").isBoolean()
];

exports.importConversation = async function(req, res) {
  const paramsErrors = validationResult(req);
  if (!paramsErrors.isEmpty())
    return res.status(422).json({ errors: paramsErrors.array() });

  const { conversations, processNlu } = req.body;
  const { project_id: projectId, env } = req.params;
  const project = await getVerifiedProject(projectId, req);
  try {
    if (!project) throw { code: 401, error: "unauthorized" };

    oldestImport = await getOldestTimeStamp(env);
    const { toAdd, notValids } = createConversationsToAdd(
      conversations,
      env,
      projectId
    );

    //delacred out of the forEach Block so it can be accessed later
    const invalidParseDatas = [];
    // add each prepared conversatin to the db, a promise all is used to ensure that all data is added before checking for errors
    await Promise.all(
      toAdd.map(async conversation => {
        Conversations.updateOne(
          { _id: conversation._id },
          conversation,
          { upsert: true },
          function(err) {
            if (err) throw err;
          }
        );
        if (processNlu) {
          const {
            parseDataToAdd,
            invalidParseData
          } = await addParseDataToActivity(
            projectId,
            conversation,
            oldestImport
          );
          if (parseDataToAdd && parseDataToAdd.length > 0) {
            await Activity.insertMany(parseDataToAdd, function(err) {
              if (err) throw err;
            });
          }
          if (invalidParseData && invalidParseData.length > 0)
            invalidParseDatas.push(invalidParseData);
        }
      })
    );

    //create a report of the errors, if any
    const formatsError = formatsErrorsSummary(notValids, invalidParseDatas);
    //object not empty
    if (Object.keys(formatsError).length !== 0)
      return res.status(206).json(formatsError);

    return res
      .status(200)
      .json({ message: "successfuly imported all conversations" });
  } catch (err) {
    return res.status(err.code || 500).json(err);
  }
};

formatsErrorsSummary = function(notValids, invalidParseDatas) {
  const formatsError = {};
  if (notValids && notValids.length > 0) {
    formatsError.messageConversation =
      "some conversation were not added, the field _id is missing";
    formatsError.notValids = notValids;
  }
  if (invalidParseDatas.length > 0) {
    formatsError.messageParseData =
      "Some parseData have not been added to activity, the corresponding models could not be found";
    formatsError.invalidParseDatas = invalidParseDatas;
  }
  return formatsError;
};

getOldestTimeStamp = async function(env) {
  const lastestAddition = await Conversations.findOne({ env: env })
    .select("updatedAt")
    .sort("-updatedAt")
    .lean()
    .exec();
  if (lastestAddition) return Math.floor(lastestAddition.updatedAt / 1000);
  return 0;
};

exports.lastestImportValidator = [
  param(
    "env",
    "environement should be one of: production, staging, development"
  ).isIn(["production", "staging", "development"])
];

exports.lastestImport = async function(req, res) {
  const paramsErrors = validationResult(req);
  if (!paramsErrors.isEmpty())
    return res.status(422).json({ errors: paramsErrors.array() });

  const { project_id: projectId } = req.params;
  const { env } = req.params;
  try {
    const project = await getVerifiedProject(projectId, req);
    if (!project) throw { code: 401, error: "unauthorized" };
    const oldest = await getOldestTimeStamp(env);
    return res.status(200).json({ timestamp: oldest });
  } catch (err) {
    return res.status(err.code || 500).json(err);
  }
};
