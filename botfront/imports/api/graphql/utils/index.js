
export const generateCuttoffs = (from, to, nBuckets) => {
    const delta = Math.abs(from - to);
    const bucketSize = (delta / nBuckets).toFixed(7);
    return Array.from(Array(nBuckets)).map((_e, i) => [
        from + i * bucketSize, i === nBuckets - 1 ? to : from + (i + 1) * bucketSize,
    ]);
};

export const generateBuckets = (from, to, pathToTimestamp, nBuckets) => (
    generateCuttoffs(from, to, nBuckets)
        .map(bounds => ({
            case: {
                $and: [
                    { $gte: [pathToTimestamp, bounds[0]] },
                    { $lt: [pathToTimestamp, bounds[1]] },
                ],
            },
            then: bounds[1].toFixed(0).toString(),
        }))
);
