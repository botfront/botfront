import Conversations from '../../conversations/conversations.model';


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
            },
        },
        {
            $project: {
                tracker: { $slice: ['$tracker', -maxEvents] }, // take the last maxevent from the array, not doable in the previous step
                trackerLen: 1,
            },
        },
    ];
    const results = await Conversations.aggregate(aggregation).allowDiskUse(true);
    return results;
};

export const insertEvents = async (senderId, projectId, events) => (
    Conversations.insert({
        _id: senderId,
        tracker: events,
        status: 'new',
        projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
    })
);

export const updateEvents = async (senderId, projectId, events) => (
    logUtterancesFromTracker(projectId, events)
    Conversations.updateOne({ _id: id }, { $set: { status } }).exec()
);

