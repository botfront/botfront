import moment from 'moment';

export const applyTimezoneOffset = (date, offset) => moment(date).utcOffset(offset, true);

const getXAxisTickInterval = (data, nTicksIncoming, wide) => {
    // nTicksIncomming is the number snap points on the x axis
    // reduce the number of ticks on the X axis so that text does not overlap
    const maxTicks = wide ? 14 : 7;
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
    hour: date => moment(date).format('HH:mm'),
    day: date => moment(date).format('DD/MM'),
    week: date => moment(date).format('DD/MM'),
    // hour: '%H:%M',
    // day: '%d/%m',
    // week: '%d/%m',
};

const formatAxisTitles = ({ axisTitleX, axisTitleY }, valueType, bucketSize) => {
    const bucketMap = { day: 'Date', hour: 'Time', week: 'Week' };
    const legendX = bucketSize ? bucketMap[bucketSize] : axisTitleX;
    const legendY = valueType === 'relative' ? `${axisTitleY} (%)` : axisTitleY;
    return {
        x: { legend: legendX || '' },
        y: { legend: legendY || '' },
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

export const calculateTemporalBuckets = (startDate, endDate, chartType, wide) => {
    // calculate if a time period is broken into hours, days or weeks
    const nDays = Math.round(((endDate.valueOf() - startDate.valueOf()) / 86400000));
    if (nDays <= 1 && !wide) return { nTicks: 12, nBuckets: 24, bucketSize: 'hour' };
    if (nDays <= 3 && wide) return { nTicks: 12, nBuckets: 24, bucketSize: 'hour' };
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
    data, queryParams, graphParams, valueType, bucketSize, nTicks, projectTimezoneOffset, size, showDenominator,
}) => {
    const dataToDisplay = formatData(data, queryParams, bucketSize, projectTimezoneOffset);
    const axisTitles = formatAxisTitles(graphParams, valueType, queryParams.temporal ? bucketSize : null);
    let paramsToUse = {
        axisLeft: { legendOffset: -46, legendPosition: 'middle', ...graphParams.axisLeft }, // default
        axisBottom: { legendOffset: 36, legendPosition: 'middle', ...graphParams.axisBottom }, // default
        ...graphParams,
        y: [...(showDenominator && graphParams.y2 ? [graphParams.y2] : []), graphParams.y],
    };
    
    if (valueType === 'relative') {
        paramsToUse.y = [{ absolute: paramsToUse.y[paramsToUse.y.length - 1].relative }];
        paramsToUse.yScale = { type: 'linear', min: 0, max: 100 };
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
    if (graphParams.xCanRepeat) { // only used by sequence for now
        paramsToUse = {
            ...paramsToUse,
            axisBottom: {
                ...(paramsToUse.axisBottom || {}),
                format: value => `Step ${value.match(/[0-9]+$/)[0]}`, // get the index from the name as it was added to make it unique
            },
            xScale: { type: 'point' },
        };
    }

    paramsToUse = {
        ...paramsToUse,
        axisBottom: { ...paramsToUse.axisBottom, ...(graphParams.noXLegend ? {} : axisTitles.x) },
        axisLeft: { ...paramsToUse.axisLeft, ...(graphParams.noYLegend ? {} : axisTitles.y) },
    };
  

    return { dataToDisplay, paramsToUse };
};

export const generateCSV = (data, queryParams, { columns }, bucketSize, projectTimezoneOffset) => {
    const exportColumns = columns.map(c => ({
        ...c,
        header: c.accessor === 'bucket' ? (bucketSize === 'hour' ? 'Time' : 'Date') : c.header,
    }));
    let formattedData = formatData(data, queryParams, bucketSize, projectTimezoneOffset);
    formattedData = formattedData.map(((elem) => {
        const { __typename, bucket, ...rest } = elem; // __typename is not exported
        const formattedElem = rest;
        if (queryParams.temporal) { // bucket is a date
            formattedElem.bucket = moment(bucket).format('DD/MM/YYYY');
            if (bucketSize === 'hour') {
                formattedElem.bucket = `${moment(bucket).format('HH:mm')} - ${moment(bucket).add(1, 'hour').subtract(1, 'millisecond').format('HH:mm')}`;
            }
        }
        let list = [];
        exportColumns.forEach(({ accessor }) => {
            list = [...list, { value: formattedElem[accessor], accessor }];
        });
        return list;
    }));
    formattedData.map(elem => elem.join()).join('\n');
    const csvKeys = exportColumns.map(({ header }) => header).join();
    const csvValues = formattedData
        .map(elem => elem.map(({ value }) => value).join()).join('\n');
    return `${csvKeys}\n${csvValues}`;
};
