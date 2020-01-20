const { Projects, NLUModels, Activity } = require('../../models/models');

async function logUtterance(modelId, parseData, callback, env = 'development') {
    const { text } = parseData;
    const newData = {
        ...parseData,
        intent: parseData.intent.name,
        confidence: parseData.intent.confidence,
    };
    const { _id, ...utterance } = { ...new Activity(newData) }._doc;
    if (!parseData.intent) utterance.intent = null;

    if (utterance.entities) {
        utterance.entities = utterance.entities.filter(e => e.extractor !== 'ner_duckling_http');
    }
    utterance.env = env;

    Activity.findOneAndUpdate(
        { modelId, text, env },
        utterance,
        {
            upsert: true,
            runValidators: true,
        },
        err => callback(utterance, err),
    );
}

async function create(req, res) {
    try {
        const model = await NLUModels.findOne({ _id: req.body.modelId }, { _id: 1 });
        if (!model) throw new Error('An existing modelId is required');
        const { modelId, parse_data } = req.body;
        logUtterance(modelId, parse_data, (utterance, error) => {
            if (error) return res.status(400).json({ error: error.name });
            return res.status(200).json(utterance);
        });
    } catch (err) {
        res.status(400).json({ error: err.toString().replace(/.*Error: /, '') });
    }
}

const logUtterancesFromTracker = async function(projectId, tracker, filter = () => true, env = 'development') {
    try {
        const userUtterances = tracker.events.filter(
            event => event.event === 'user' && event.text.indexOf('/') !== 0,
        )
            .filter(filter);
        if (userUtterances.length) {
            const { language } = userUtterances[0].metadata || {}; // take lang from first
            const project = await Projects.findOne({ _id: projectId }, { nlu_models: 1, defaultLanguage: 1 }).lean();
            const { defaultLanguage } = project;
            if (!language && !defaultLanguage) return;
            const model = await NLUModels.findOne(
                {
                    language: language || defaultLanguage,
                    _id: { $in: project.nlu_models },
                },
                { _id: 1 },
            ).lean();
            if (!model) return;
            userUtterances.forEach(u =>
                logUtterance(
                    model._id,
                    u.parse_data,
                    (_u, e) => e && console.log('Logging failed: ', e, u),
                    env,
                ),
            );
        }
    } catch (e) {
        console.log('Logging failed: ', e);
    }
};

module.exports = { create, logUtterance, logUtterancesFromTracker };
