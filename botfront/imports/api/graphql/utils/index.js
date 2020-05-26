
export const generateCuttoffs = (from, to, nBuckets) => {
    const delta = Math.abs(from - to);
    const bucketSize = (delta / nBuckets).toFixed(7);
    return Array.from(Array(nBuckets)).map((_e, i) => [
        from + i * bucketSize, i === nBuckets - 1 ? to : from + (i + 1) * bucketSize,
    ]);
};

export const generateBuckets = (from, to, pathToTimestamp, nBuckets, conversion = v => v) => (
    generateCuttoffs(from, to, nBuckets)
        .map((bounds, i, emptyBuckets) => {
            if (i === emptyBuckets.length - 1) {
                return {
                    case: {
                        $and: [
                            { $gte: [pathToTimestamp, conversion(bounds[0])] },
                            { $lt: [pathToTimestamp, conversion(bounds[1])] },
                        ],
                    },
                    then: bounds[1].toFixed(0).toString(),
                };
            }
            return {
                case: {
                    $and: [
                        { $gte: [pathToTimestamp, conversion(bounds[0])] },
                        { $lt: [pathToTimestamp, conversion(bounds[1])] },
                    ],
                },
                then: bounds[1].toFixed(0).toString(),
            };
        })
);

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
