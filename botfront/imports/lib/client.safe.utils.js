export function clearTypenameField(object) {
    const omitTypename = (key, value) => (key === '__typename' ? undefined : value);
    const cleanedObject = JSON.parse(JSON.stringify(object), omitTypename);
    return cleanedObject;
}

export const cleanPayload = (payload) => {
    const clean = clearTypenameField(payload);
    Object.keys(payload).forEach((k) => {
        if (
            ![
                'text',
                'metadata',
                'quick_replies',
                'buttons',
                'image',
                'elements',
                'attachment',
                'custom',
            ].includes(k)
        ) { delete clean[k]; }
    });
    return clean;
};

export const formNameIsValid = name => name.match(/^[a-zA-Z0-9-_]+_form$/) && name.split('form').length === 2;

export const dropNullValuesFromObject = obj => Object.entries(obj).reduce(
    (acc, [key, val]) => ({
        ...acc,
        ...(val === undefined || val === null ? {} : { [key]: val }),
    }),
    {},
);

export const insertSmartPayloads = ({ rules = [], triggerIntent, ...fragment }) => {
    if (!rules.length) return fragment;
    let payloads = rules.map(rule => ({
        intent: triggerIntent,
        entities: (rule?.trigger?.queryString || []).reduce(
            (acc, curr) => [
                ...acc,
                ...(curr.sendAsEntity ? [{ [curr.param]: curr.param }] : []),
            ],
            [],
        ),
    }));
    if (fragment.steps?.[0]?.intent) {
        payloads.unshift(fragment.steps.shift());
    } else if (fragment.steps?.[0]?.or) {
        const { or } = fragment.steps.shift();
        payloads = or.concat(payloads);
    }
    const steps = [
        payloads.length > 1 ? { or: payloads } : payloads[0],
        ...(fragment.steps || []),
    ];
    return {
        ...fragment,
        steps,
        metadata: { ...(fragment.metadata || {}), rules, triggerIntent },
    };
};

export const caught = func => async (done) => {
    try {
        await func();
        done();
    } catch (e) {
        done(e);
    }
};
