

const xTickFilter = (data, nTicks) => {
    // const nTicks = bucketSize === 'hour' ? 12 : 7;
    const tickSpacing = data.length > nTicks
        ? Math.floor(data.length / nTicks)
        : 1;
    const tickValues = data.map(({ bucket }, index) => {
        if (index % tickSpacing === 0) return bucket;
        return undefined; // discard the value
    });
    return tickValues.filter(e => !!e);
};

const dateFormatDictionary = {
    hour: '%H:%M',
    day: '%d/%m',
};

const formatDateBuckets = (data, bucketSize) => data
    .map((c) => {
        if (bucketSize === 'day') {
            return {
                ...c,
                bucket: new Date(parseInt(c.bucket, 10) * 1000 - 43200000),
            };
        }
        if (bucketSize === 'hour') {
            return {
                ...c,
                bucket: new Date(parseInt(c.bucket, 10) * 1000 - 3600000),
            };
        }
        return {
            ...c,
            bucket: new Date(parseInt(c.bucket, 10) * 1000),
        };
    });

export const calculateTemporalBuckets = (startDate, endDate) => {
    const nDays = Math.round(((endDate.valueOf() - startDate.valueOf()) / 86400000));
    if (nDays <= 1) return { nTicks: 12, nBuckets: 24, bucketSize: 'hour' };
    if (nDays <= 7) return { nTicks: +nDays.toFixed(0), nBuckets: +nDays.toFixed(0), bucketSize: 'day' };
    if (nDays <= 90) return { nTicks: 7, nBuckets: +nDays.toFixed(0), bucketSize: 'day' };
    return { tickValues: 7, nBuckets: Math.floor(+nDays.toFixed(0) / 7), bucketSize: 'day' };
};

export const getDataToDisplayAndParamsToUse = ({
    data, queryParams, graphParams, valueType, bucketSize, nTicks,
}) => {
    let dataToDisplay = data[queryParams.queryName];
    if (queryParams.temporal) dataToDisplay = formatDateBuckets(dataToDisplay, bucketSize);
    let paramsToUse = valueType === 'relative'
        ? {
            ...graphParams,
            yScale: { type: 'linear', min: 0, max: 100 },
            axisLeft: { legend: '%', legendOffset: -36 },
            ...graphParams.rel,
        }
        : graphParams;
    paramsToUse = queryParams.temporal
        ? {
            ...paramsToUse,
            axisBottom: { tickValues: xTickFilter(dataToDisplay, nTicks), format: dateFormatDictionary[bucketSize] },
            xScale: { type: 'time', format: 'native' },
        }
        : paramsToUse;
    return { dataToDisplay, paramsToUse };
};
