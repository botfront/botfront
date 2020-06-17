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
                'tracker.sender_id': 1,
                'tracker.slots': 1,
                'tracker.latest_message': 1,
                'tracker.latest_event_time': 1,
                'tracker.followup_action': 1,
                'tracker.latest_input_channel': 1,
                'tracker.active_form': 1,
                'tracker.latest_action_name': 1,
                'tracker.events': {
                    $slice: [
                        '$tracker.events',
                        { $subtract: [after, { $size: '$tracker.events' }] },
                    ],
                },
                trackerLen: { $size: '$tracker.events' },
            },
        },
        {
            $addFields: {
                'tracker.events': { $slice: ['$tracker.events', -maxEvents] },
                // take the last <maxevent> elements from the array, not doable in the previous step
                lastTimeStamp: '$tracker.latest_event_time',
            },
        },
    ];
    const results = await Conversations.aggregate(aggregation).allowDiskUse(true);
    return results[0];
};

const getNewTrackerInfo = async (senderId, projectId) => {
    const aggregation = [
        {
            $match: {
                _id: senderId,
                projectId,
            },
        },
        {
            $project: {
                trackerLen: { $size: '$tracker.events' },
                lastTimeStamp: '$tracker.latest_event_time',
            },
        },
    ];
    const results = await Conversations.aggregate(aggregation).allowDiskUse(true);
    if (!results.length) return { _id: senderId };
    return results[0];
};

const extractMetadataFromTracker = (tracker) => {
    if (!tracker) return {};
    const firstUserEvent = (tracker.events || []).find(
        e => e.event === 'user' && Object.keys(e.metadata || {}).length,
    );
    if (firstUserEvent) return firstUserEvent.metadata;
    return {};
};

async function logUtterance(utterance, modelId, convId, env, callback) {
    const { parse_data: parseData, message_id: mid } = utterance;
    const { text } = parseData;
    const newData = {
        ...parseData,
        conversation_id: convId,
        message_id: mid,
        intent: parseData.intent.name,
        confidence: parseData.intent.confidence,
        createdAt: new Date(utterance.timestamp),
    };

    // eslint-disable-next-line no-underscore-dangle
    const { _id, ...newUtterance } = { ...new Activity(newData) }._doc;
    if (!parseData.intent) newUtterance.intent = null;

    if (utterance.entities) {
        newUtterance.entities = utterance.entities.filter(
            e => e.extractor !== 'ner_duckling_http',
        );
    }

    Activity.findOneAndUpdate(
        { modelId, text, env },
        {
            $set: newUtterance,
            $setOnInsert: { _id: uuidv4() },
        },
        {
            upsert: true,
            runValidators: true,
        },
        err => callback(newUtterance, err),
    );
}
const logUtterancesFromTracker = async function (projectId, events, env, convId) {
    try {
        const userUtterances = events.filter(
            event => event.event === 'user' && event.text.indexOf('/') !== 0,
        );
        if (userUtterances.length) {
            const { language } = userUtterances[0].metadata || {}; // take lang from first
            const project = await Projects.findOne(
                { _id: projectId },
                { nlu_models: 1, defaultLanguage: 1 },
            ).lean();
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
            userUtterances.forEach(utterance => logUtterance(
                utterance,
                model._id,
                convId,
                env,
                (_, e) => e && console.log('Logging failed: ', e, utterance),
            ));
        }
    } catch (e) {
        console.log('Logging failed: ', e);
    }
};

export const upsertTrackerStore = async ({
    senderId,
    projectId,
    tracker,
    env = 'development',
    overwriteEvents = false,
    importConversationsOnly = false,
}) => {
    const { userId, language } = extractMetadataFromTracker(tracker);
    const { events = [] } = tracker;

    if (!importConversationsOnly && !process.argv.includes('--logConversationsOnly')) {
        logUtterancesFromTracker(projectId, events, env, senderId);
    }

    let failed = false;
    let inserted = [];
    try {
        const setTracker = {};
        Object.keys(tracker).forEach((key) => {
            if (key !== 'events') {
                setTracker[`tracker.${key}`] = tracker[key];
            }
        });
        const intents = events
            .filter(event => event.event === 'user')
            .map(event => event.parse_data.intent.name);
        const actions = events
            .filter(event => event.event === 'action')
            .map(event => event.name);
        const firstEventTimestamp = (events[0] || {}).timestamp;

        const { ok, upserted = [] } = await Conversations.update(
            { projectId, _id: senderId, env },
            {
                ...(!overwriteEvents
                    ? {
                        $push: {
                            'tracker.events': { $each: events },
                        },
                    }
                    : {}),
                $set: {
                    ...setTracker,
                    ...(overwriteEvents ? { 'tracker.events': events } : {}),
                    updatedAt: new Date(),
                    ...(userId ? { userId } : {}),
                    ...(language ? { language } : {}),
                },
                $addToSet: {
                    intents: { $each: intents },
                    actions: { $each: actions },
                },
                $setOnInsert: {
                    status: 'new',
                    createdAt: firstEventTimestamp
                        ? new Date(firstEventTimestamp)
                        : new Date(),
                },
            },
            { upsert: true },
        );
        failed = !ok;
        inserted = upserted;
    } catch (e) {
        failed = true;
    }
    return {
        ...(await getNewTrackerInfo(senderId, projectId)),
        status: failed ? 'failed' : inserted.length ? 'inserted' : 'updated',
    };
};
