import moment from 'moment';

const xTickFilter = (data, nTicksIncoming) => {
    const maxTicks = 7;
    const nTicks = nTicksIncoming > maxTicks ? maxTicks : nTicksIncoming;
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
    week: '%d/%m',
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
            bucket: new Date(parseInt(c.bucket, 10) * 1000 - 43200000),
        };
    });

export const calculateTemporalBuckets = (startDate, endDate, chartType) => {
    const nDays = Math.round(((endDate.valueOf() - startDate.valueOf()) / 86400000));
    if (nDays <= 1) return { nTicks: 12, nBuckets: 24, bucketSize: 'hour' };
    if (nDays <= 7) return { nTicks: +nDays.toFixed(0), nBuckets: +nDays.toFixed(0), bucketSize: 'day' };
    if (nDays <= 90) return { nTicks: 7, nBuckets: +nDays.toFixed(0), bucketSize: 'day' };
    if (chartType === 'table') return { nTicks: 7, nBuckets: +nDays.toFixed(0), bucketSize: 'day' };
    return { nTicks: 7, nBuckets: Math.floor(+nDays.toFixed(0) / 7), bucketSize: 'week' };
};

export const formatData = (data, queryParams, bucketSize) => {
    let formattedData = data[queryParams.queryName];
    if (queryParams.temporal) formattedData = formatDateBuckets(formattedData, bucketSize);
    return formattedData;
};

export const getDataToDisplayAndParamsToUse = ({
    data, queryParams, graphParams, valueType, bucketSize, nTicks,
}) => {
    const dataToDisplay = formatData(data, queryParams, bucketSize);
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

export const generateCSV = (data, queryParams, bucketSize) => {
    let formattedData = formatData(data, queryParams, bucketSize);
    formattedData = formattedData.map(((elem) => {
        const { __typename, ...rest } = elem; // __typename is not exported
        if (queryParams.temporal) { // rest.bucket is a date
            if (bucketSize === 'day') {
                rest.date = moment(rest.bucket).format('DD/MM/YYYY');
            }
            if (bucketSize === 'hour') {
                rest.time = `${moment(rest.bucket).toISOString()} - ${moment(rest.bucket).add(1, 'hour').subtract(1, 'millisecond').toISOString()}`;
            }
            if (bucketSize === 'week') {
                rest.date = moment(rest.bucket).format('DD/MM/YYYY');
            }
            delete rest.bucket;
        }
        return rest;
    }));
    const csvKeys = Object.keys(formattedData[0]).join();
    const csvValues = formattedData
        .map(elem => Object.values(elem).join())
        .join('\n');
    return `${csvKeys}\n${csvValues}`;
};
