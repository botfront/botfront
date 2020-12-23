
import { DDP } from 'meteor/ddp-client';
import { DDPCommon } from 'meteor/ddp-common';

export const generateWeekCutoffs = (from, to, nBuckets) => {
    const duration = to - from;
    const days = Math.ceil(duration / (3600 * 24));
    const groupDuration = Math.floor(days / (nBuckets)) * 24 * 3600;
    const groups = Array.from(Array(nBuckets)).map((e, i) => [
        from + i * groupDuration,
        from + (i + 1) * groupDuration - 1,
    ]);
    return [...groups, [from + nBuckets * groupDuration, to]];
};

export const generateCuttoffs = (from, to, nBuckets) => {
    const delta = Math.abs(from - to);
    const bucketSize = (delta / nBuckets).toFixed(7);
    if (bucketSize > 24 * 3600) return generateWeekCutoffs(from, to, nBuckets);
    return Array.from(Array(nBuckets)).map((_e, i) => [
        from + i * bucketSize, i === nBuckets - 1 ? to : from + (i + 1) * bucketSize,
    ]);
};

export const generateBuckets = (from, to, pathToTimestamp, nBuckets, conversion = v => v) => generateCuttoffs(from, to, nBuckets)
    .map(bounds => ({
        case: {
            $and: [
                { $gte: [pathToTimestamp, conversion(bounds[0])] },
                { $lt: [pathToTimestamp, conversion(bounds[1])] },
            ],
        },
        then: bounds[1].toFixed(0).toString(),
    }));

export const fillInEmptyBuckets = async (collection, from, to, nBuckets) => {
    // This function inserts buckets with no data in them, so that the full graph can be seen
    if (!collection.length) return collection;
    const zeroObject = {};
    Object.keys(collection[0]).forEach((key) => {
        if (key !== 'bucket') zeroObject[key] = 0;
    });
    const zeroBuckets = generateBuckets(from, to, 'ha', nBuckets).map(b => ({ ...zeroObject, bucket: b.then }));
    return zeroBuckets.reduce((acc, curr) => {
        const bucketInCollection = collection.find(b => b.bucket === curr.bucket);
        if (bucketInCollection) return [...acc, bucketInCollection];
        return [...acc, curr];
    }, []);
};

// eslint-disable-next-line no-underscore-dangle
export const addMeteorUserToCall = (user, funcCall) => DDP._CurrentInvocation.withValue(
    new DDPCommon.MethodInvocation({ user, userId: user._id }),
    funcCall,
);
