import uuidv4 from 'uuid/v4';
import Conversations from '../../conversations/conversations.model';
import Activity from '../../activity/activity.model';
import Projects from '../../project/project.model';
import NLUModels from '../../nlu/nlu.model';

export const getTracker = async (senderId, projectId, after, maxEvents = 100) => {
    const aggregation = [
        {
            $match: {
                _id: senderId,
                projectId,
            },
        },
        {
            $project: {
                // retreive the last elements of the array from the index after
                // index - len give us the x last element we want to fetch
                tracker: { $slice: ['$tracker.events', { $subtract: [after + 1, { $size: '$tracker.events' }] }] },
                trackerLen: { $size: '$tracker.events' },
                lastTimeStamp: { $slice: ['$tracker.events', -1] },
            },
        },
        {
            $project: {
                tracker: { $slice: ['$tracker', -maxEvents] }, // take the last <maxevent> elements from the array, not doable in the previous step
                trackerLen: 1,
                lastTimeStamp: { $arrayElemAt: ['$lastTimeStamp.timestamp', 0] },
            },
        },
    ];
    const results = await Conversations.aggregate(aggregation).allowDiskUse(true);
    return results[0];
};

export const insertTrackerStore = async (senderId, projectId, tracker) => (
    Conversations.create({
        _id: senderId,
        tracker,
        status: 'new',
        projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
    })
);

const extractMetadataFromTracker = (tracker) => {
    if (!tracker || !tracker.events) return null;
    const { metadata } = tracker.events.filter(e => e.event === 'user')[0] || { metadata: {} };
    return metadata;
};

async function logUtterance(modelId, parseData, callback, env = 'development') {
    const { text } = parseData;
    const newData = {
        ...parseData,
        intent: parseData.intent.name,
        confidence: parseData.intent.confidence,
    };
    // eslint-disable-next-line no-underscore-dangle
    const { _id, ...utterance } = { ...new Activity(newData) }._doc;
    if (!parseData.intent) utterance.intent = null;

    if (utterance.entities) {
        utterance.entities = utterance.entities.filter(e => e.extractor !== 'ner_duckling_http');
    }
    utterance.env = env;

    Activity.updateOne(
        { modelId, text, env },
        {
            $set: utterance,
            $setOnInsert: { _id: uuidv4() },
        },
        {
            upsert: true,
            runValidators: true,
        },
        err => callback(utterance, err),
    );
}
const logUtterancesFromTracker = async function (projectId, tracker, filter = () => true, env = 'development') {
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
            userUtterances.forEach(u => logUtterance(
                model._id,
                u.parse_data,
                (_u, e) => e && console.log('Logging failed: ', e, u),
                env,
            ));
        }
    } catch (e) {
        console.log('Logging failed: ', e);
    }
};


export const updateTrackerStore = async (senderId, projectId, tracker) => {
    if (!process.argv.includes('--logConversationsOnly')) logUtterancesFromTracker(projectId, tracker);

    const { userId, language } = extractMetadataFromTracker(tracker);
    const setTracker = {};
    Object.keys(tracker).forEach((key) => {
        if (key !== 'events') {
            setTracker[`tracker.${key}`] = tracker[key];
        }
    });
    const intents = tracker.events.filter(event => event.event === 'user').map((event => event.parse_data.intent.name));
    const actions = tracker.events.filter(event => event.event === 'action').map((event => event.name));

    const exist = Conversations.findOne({ _id: senderId });
    if (exist) {
        return Conversations.updateOne(
            { _id: senderId },
            {
                $push: {
                    'tracker.events': { $each: tracker.events },
                },
                $set: {
                    ...setTracker,
                    updatedAt: new Date(),
                    ...({ userId } || {}),
                    ...({ language } || {}),
                },
                $addToSet: {
                    intents: { $each: intents },
                    actions: { $each: actions },
                },
            },
        );
    }
    return insertTrackerStore(senderId, projectId, tracker);
};
