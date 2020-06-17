export const queryifyFilter = (key, value) => {
    switch (key) {
    case 'intentsActionsFilters':
        return JSON.stringify(value);
    case 'lengthFilter':
    case 'confidenceFilter':
    case 'durationFilter':
        return value && JSON.stringify(value);
    case 'startDate':
    case 'endDate':
        return value && value.toISOString();
    default:
        return value;
    }
};
