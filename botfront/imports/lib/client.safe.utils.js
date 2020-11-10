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
