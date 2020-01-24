const triggerValidators = {
    url: value => !value.find(urlString => !urlString),
    numberOfVisits: value => value !== undefined,
    numberOfPageVisits: value => value !== undefined,
    device: value => value !== undefined,
    queryString: v => !v.find(e => !(
        e && e.param && e.param.length > 0
        && e.value && e.value.length > 0
    )),
    timeOnPage: value => value !== undefined,
    eventListeners: v => !v.find(e => !(
        e && e.selector && e.selector.length
        && e.event
    )),
};

const hasTrigger = trigger => (
    typeof trigger === 'object'
    && Object.keys(trigger).filter((key) => {
        if (!trigger[key]) return true;
        return !triggerValidators[key](trigger[key]);
    })
);

export const checkHasTriggers = (rules) => {
    rules.filter(rule => (rule.trigger && hasTrigger(rule.trigger)));
};
