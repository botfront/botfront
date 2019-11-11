const formatDateBuckets = data => data
    .map(c => ({
        ...c,
        bucket: new Date(parseInt(c.bucket, 10) * 1000),
    }));

export const calculateTemporalBuckets = (endDate, startDate) => {
    const nDays = +((endDate.valueOf() - startDate.valueOf()) / 86400000);
    if (nDays <= 1) return { tickValues: 7, nBuckets: 24 };
    if (nDays <= 7) return { tickValues: +nDays.toFixed(0), nBuckets: +nDays.toFixed(0) };
    if (nDays <= 90) return { tickValues: 7, nBuckets: +nDays.toFixed(0) };
    return { tickValues: 7, nBuckets: Math.floor(+nDays.toFixed(0) / 7) };
};

export const getDataToDisplayAndParamsToUse = ({
    data, queryParams, graphParams, tickValues, valueType,
}) => {
    let dataToDisplay = data[queryParams.queryName];
    if (queryParams.temporal) dataToDisplay = formatDateBuckets(dataToDisplay);
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
            axisBottom: { tickValues, format: '%d/%m' },
            xScale: { type: 'time', format: 'native' },
        }
        : paramsToUse;
    return { dataToDisplay, paramsToUse };
};
