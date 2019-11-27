import moment from 'moment';

export const applyTimezoneOffset = (date, offset) => moment(date).utcOffset(offset, true);

export const formatDataForTable = (data) => {
    // remove the unit from the table
    // NO LONGER NEEDED
    let formattedData = data;
    if (data && data[0] && data[0].duration) {
        formattedData = formattedData.map(dataElem => ({
            ...dataElem,
            duration: dataElem.duration.replace(/s/g, ''),
        }));
    }
    return formattedData;
};

const getXAxisTickInterval = (data, nTicksIncoming, size) => {
    // nTicksIncomming is the number snap points on the x axis
    // reduce the number of ticks on the X axis so that text does not overlap
    const maxTicks = size === 'wide' ? 14 : 7;
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
    // find the first value in an array to match a property in an object
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
    // get the axis title and unit values based on the current state of the chart
    const titleTextX = axisTitleX ? matchOption(axisTitleX, options) : '';
    const titleTextY = axisTitleY ? matchOption(axisTitleY, options) : '';
    const unitTextX = unitX && matchOption(unitX, options);
    const unitTextY = unitY && matchOption(unitY, options);
    return {
        x: { legend: `${titleTextX}${unitTextX || ''}` },
        y: { legend: `${titleTextY}${unitTextY || ''}` },
    };
};

const formatDateBuckets = (data, bucketSize, projectTimezoneOffset) => data
    .map((c) => {
        // change the value in the date bucket from the end time to the start time
        // or middle of the day if the period is one day long
        const localTimezone = new Date(parseInt(c.bucket, 10) * 1000 - 43200000).getTimezoneOffset() * 60 * 1000 + projectTimezoneOffset * 60 * 60 * 1000;
        if (bucketSize === 'day') {
            return {
                ...c,
                bucket: new Date(parseInt(c.bucket, 10) * 1000 - 43200000 + localTimezone),
            };
        }
        if (bucketSize === 'hour') {
            return {
                ...c,
                // subtract one hour from the time to match the start of the time period rather than the end
                bucket: new Date(parseInt(c.bucket, 10) * 1000 - (60 * 60 * 1000) + localTimezone),
            };
        }
        return {
            ...c,
            bucket: new Date(parseInt(c.bucket, 10) * 1000 - 43200000 + localTimezone),
        };
    });

export const calculateTemporalBuckets = (startDate, endDate, chartType, size) => {
    // calculate if a time period is broken into hours, days or weeks
    const nDays = Math.round(((endDate.valueOf() - startDate.valueOf()) / 86400000));
    if (nDays <= 1 && size !== 'wide') return { nTicks: 12, nBuckets: 24, bucketSize: 'hour' };
    if (nDays <= 3 && size === 'wide') return { nTicks: 12, nBuckets: 24, bucketSize: 'hour' };
    if (nDays <= 7) return { nTicks: nDays, nBuckets: nDays, bucketSize: 'day' };
    if (nDays <= 90) return { nTicks: 7, nBuckets: nDays, bucketSize: 'day' };
    if (chartType === 'table') return { nTicks: 7, nBuckets: nDays, bucketSize: 'day' };
    return { nTicks: 7, nBuckets: Math.floor(nDays / 7), bucketSize: 'week' };
};

const findDurationEnd = (num, cutoffs) => (
    cutoffs[cutoffs.indexOf(parseInt(num, 10)) + 1]
);

const formatDuration = (data, { cutoffs }) => {
    // find the end time of a duration based on the starttime and the intervals in the api request
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

export const formatData = (data, queryParams, bucketSize, projectTimezoneOffset) => {
    let formattedData = data[queryParams.queryName];
    if (formattedData[0] && formattedData[0].duration) formattedData = formatDuration(formattedData, queryParams);
    if (queryParams.temporal) formattedData = formatDateBuckets(formattedData, bucketSize, projectTimezoneOffset);
    return formattedData;
};

export const getDataToDisplayAndParamsToUse = ({
    data, queryParams, graphParams, valueType, bucketSize, nTicks, projectTimezoneOffset, size,
}) => {
    const dataToDisplay = formatData(data, queryParams, bucketSize, projectTimezoneOffset);
    const axisTitles = formatAxisTitles(graphParams, [bucketSize, valueType]);
    let paramsToUse = graphParams;
    
    if (valueType === 'relative') {
        paramsToUse = {
            ...graphParams,
            yScale: { type: 'linear', min: 0, max: 100 },
            axisLeft: { ...graphParams.axisLeft },
            ...graphParams.rel,
        };
    }

    if (queryParams.temporal) {
        paramsToUse = {
            ...paramsToUse,
            axisBottom: {
                ...(paramsToUse.axisBottom || {}),
                tickValues: getXAxisTickInterval(dataToDisplay, nTicks, size),
                format: dateFormatDictionary[bucketSize],
            },
            xScale: { type: 'time', format: 'native' },
        };
    }

    paramsToUse = {
        ...paramsToUse,
        axisBottom: { ...paramsToUse.axisBottom, ...axisTitles.x },
        axisLeft: { ...paramsToUse.axisLeft, ...axisTitles.y },
    };
    return { dataToDisplay, paramsToUse };
};

export const generateCSV = (data, queryParams, bucketSize, projectTimezoneOffset) => {
    // create csv formatted data for export
    let formattedData = formatData(data, queryParams, bucketSize, projectTimezoneOffset);
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
                    time: `${moment(bucket).format('HH:mm')} - ${moment(bucket).add(1, 'hour').subtract(1, 'millisecond').format('HH:mm')}`,
                    date: moment(bucket).format('DD/MM/YYYY'),
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
