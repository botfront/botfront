const checkQueryString = (field) => {
    if (!field.sendAsEntity) {
        return (
            field && field.param && field.param.length > 0
            && field.value && field.value.length > 0
        );
    }
    return (field && field.param && field.param.length > 0);
};

const checkEventListener = field => (
    field && field.selector && field.selector.length
    && field.event
);

const triggerValidators = {
    // for array fields, check that AT LEAST ONE element has been filled out correctly
    url: value => !!value.some(urlString => urlString.length > 0),
    numberOfVisits: value => value || value === 0,
    numberOfPageVisits: value => value || value === 0,
    device: value => value,
    queryString: v => !!v.some(checkQueryString),
    timeOnPage: value => value || value === 0,
    eventListeners: v => !!v.some(checkEventListener),
    text: value => value && value.length > 0,
};

export const eachTriggerValidators = {
    // for array fields, check that ALL elements have been filled out correctly
    ...triggerValidators,
    url: value => value && value.length > 0 && !!value.every(urlString => urlString && urlString.length > 0),
    queryString: v => v && v.length > 0 && !!v.every(checkQueryString),
    eventListeners: v => v && v.length > 0 && !!v.every(checkEventListener),
};

export const hasTrigger = trigger => (
    typeof trigger === 'object'
        && Object.keys(trigger).some((key) => {
            if (!trigger[key] && trigger[key] !== 0) return false;
            if (!triggerValidators[key]) return false;
            if (trigger[`${key}__DISPLAYIF`] === false) return false;
            return triggerValidators[key](trigger[key]);
        })
);

export const hasTriggerRules = rules => rules.some(rule => (rule.trigger && hasTrigger(rule.trigger)));
