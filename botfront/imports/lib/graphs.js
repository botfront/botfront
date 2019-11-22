import moment from 'moment';

export const formatDataForTable = (data) => {
    let formattedData = data;
    if (data && data[0] && data[0].duration) {
        formattedData = formattedData.map(dataElem => ({
            ...dataElem,
            duration: dataElem.duration.replace(/s/g, ''),
        }));
    }
    return formattedData;
};

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

const matchOption = (object, options) => {
    if (!object) return undefined;
    const validOptions = options.filter(option => option in object);
    return object[validOptions[0]] || object.default;
};

const formatAxisTitles = (
    {
        axisTitleX, axisTitleY, unitX, unitY,
    },
    options,
) => {
    const titleTextX = axisTitleX ? matchOption(axisTitleX, options) : '';
    const titleTextY = axisTitleY ? matchOption(axisTitleY, options) : '';
    const unitTextX = unitX && matchOption(unitX, options);
    const unitTextY = unitY && matchOption(unitY, options);
    return {
        x: { legend: `${titleTextX}${unitTextX ? ` (${unitTextX})` : ''}` },
        y: { legend: `${titleTextY}${unitTextY ? ` (${unitTextY})` : ''}` },
    };
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

const findDurationEnd = (num, cutoffs) => (
    cutoffs[cutoffs.indexOf(parseInt(num, 10)) + 1]
);

const formatDuration = (data, { cutoffs }) => {
    const formattedData = data.map((dataElem) => {
        if (parseInt(dataElem.duration, 10) === cutoffs[cutoffs.length - 1]) {
            return {
                ...dataElem,
                duration: `> ${dataElem.duration}`,
            };
        }
        if (parseInt(dataElem.duration, 10) === 0) {
            return {
                ...dataElem,
                duration: `< ${findDurationEnd(dataElem.duration, cutoffs)}`,
            };
        }
        return {
            ...dataElem,
            duration: `${dataElem.duration} < ${findDurationEnd(dataElem.duration, cutoffs)}`,
        };
    });
    return formattedData;
};

export const formatData = (data, queryParams, bucketSize) => {
    let formattedData = data[queryParams.queryName];
    if (formattedData[0] && formattedData[0].duration) formattedData = formatDuration(formattedData, queryParams);
    if (queryParams.temporal) formattedData = formatDateBuckets(formattedData, bucketSize);
    return formattedData;
};

export const getDataToDisplayAndParamsToUse = ({
    data, queryParams, graphParams, valueType, bucketSize, nTicks,
}) => {
    const dataToDisplay = formatData(data, queryParams, bucketSize, graphParams);
    const axisTitles = formatAxisTitles(graphParams, [bucketSize, valueType]);
    let paramsToUse = valueType === 'relative'
        ? {
            ...graphParams,
            yScale: { type: 'linear', min: 0, max: 100 },
            axisLeft: { ...graphParams.axisLeft },
            ...graphParams.rel,
        }
        : graphParams;
    paramsToUse = queryParams.temporal
        ? {
            ...paramsToUse,
            axisBottom: {
                ...(paramsToUse.axisBottom || {}),
                tickValues: xTickFilter(dataToDisplay, nTicks),
                format: dateFormatDictionary[bucketSize],
            },
            xScale: { type: 'time', format: 'native' },
        }
        : paramsToUse;
    paramsToUse = {
        ...paramsToUse,
        axisBottom: { ...paramsToUse.axisBottom, ...axisTitles.x },
        axisLeft: { ...paramsToUse.axisLeft, ...axisTitles.y },
    };
    return { dataToDisplay, paramsToUse };
};

export const generateCSV = (data, queryParams, bucketSize, graphParams) => {
    let formattedData = formatData(data, queryParams, bucketSize, graphParams);
    formattedData = formatDataForTable(formattedData);
    formattedData = formattedData.map(((elem) => {
        const { __typename, bucket, ...rest } = elem; // __typename is not exported
        let formattedElem = rest;
        if (queryParams.temporal) { // bucket is a date
            if (bucketSize === 'day') {
                formattedElem = {
                    date: moment(bucket).format('DD/MM/YYYY'),
                    ...rest,
                };
            }
            if (bucketSize === 'hour') {
                formattedElem = {
                    time: `${moment(bucket).toISOString()} - ${moment(bucket).add(1, 'hour').subtract(1, 'millisecond').toISOString()}`,
                    ...rest,
                };
            }
            if (bucketSize === 'week') {
                rest.date = moment(bucket).format('DD/MM/YYYY');
            }
        }
        return formattedElem;
    }));
    const csvKeys = Object.keys(formattedData[0]).join();
    const csvValues = formattedData
        .map(elem => Object.values(elem).join())
        .join('\n');
    return `${csvKeys}\n${csvValues}`;
};
