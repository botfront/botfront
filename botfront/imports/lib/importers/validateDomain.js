import { safeLoad, safeDump } from 'js-yaml';
import { isEqual } from 'lodash';

const INTERNAL_SLOTS = [
    'bf_forms',
    'fallback_language',
];


const validateADomain = (
    file,
    {
        defaultDomain = {},
        projectLanguages = [],
        fallbackImportLanguage,
    },
) => {
    const { rawText } = file;
    let domain;
    try {
        domain = safeLoad(rawText);
    } catch (e) {
        return {
            file, dataType: 'domain', rawText, errors: [...(file?.errors || []), 'Not valid yaml'],
        };
    }
    const {
        slots: slotsFromFile = {},
        templates: legacyResponsesFromFile = {},
        responses: modernResponsesFromFile = {},
        forms: formsFromFile = {},
    } = domain;
    const {
        slots: defaultSlots = {},
        responses: defaultResponses = {},
        forms: defaultForms = {},
    } = defaultDomain;
    const responsesFromFile = {
        ...(legacyResponsesFromFile || {}),
        ...(modernResponsesFromFile || {}),
    };
    // get forms MIGHT NEED TO UPDATE WITH RASA 2
    const bfForms = 'bf_forms' in (slotsFromFile || {})
        ? slotsFromFile.bf_forms.initial_value
        : [];
    // do not import slots that are in current default domain or are programmatically generated
    [...Object.keys(defaultSlots), ...INTERNAL_SLOTS].forEach((k) => {
        delete slotsFromFile[k];
    });
    // do not import responses that are in current default domain
    Object.keys(defaultResponses).forEach((k) => {
        delete responsesFromFile[k];
    });
    // do not import forms that are in current default domain
    Object.keys(defaultForms).forEach((k) => {
        delete formsFromFile[k];
    });

    const warnings = [];
    const responses = [];
    const slots = [];

    Object.keys(responsesFromFile).forEach((key) => {
        const response = responsesFromFile[key];
        const values = [];
        let firstMetadataFound;
        response.forEach((item) => {
            const { language, metadata, ...rest } = item;
            const content = typeof item === 'string'
                ? safeDump({ text: item })
                : safeDump(rest);
            const lang = language || fallbackImportLanguage;
            if (!firstMetadataFound && metadata) firstMetadataFound = metadata;
            if (firstMetadataFound && !isEqual(firstMetadataFound, metadata)) {
                warnings.push(
                    `Different metadata found for single response '${key}', but Botfront does not support it.`,
                );
            }
            if (!projectLanguages.includes(lang)) {
                warnings.push(
                    `Response '${key}' defined for '${lang}', but no such language used by project.`,
                );
            } else {
                const valueIndex = values.findIndex(v => v.lang === lang);
                if (valueIndex > -1) {
                    values[valueIndex].sequence = [
                        ...values[valueIndex].sequence,
                        { content },
                    ];
                } else {
                    values.push({ lang, sequence: [{ content }] });
                }
            }
        });
        if (values.length) {
            responses.push({
                ...(firstMetadataFound ? { metadata: firstMetadataFound } : {}),
                values,
                key,
            });
        }
    });
    // MIGHT NEED TO UPDATE WITH RASA 2
    Object.keys(slotsFromFile || {}).forEach((name) => {
        const slot = slotsFromFile[name];
        const options = {};
        if (slot.min_value) options.minValue = slot.min_value;
        if (slot.max_value) options.maxValue = slot.max_value;
        if (slot.initial_value) options.initialValue = slot.initial_value;
        if (slot.values) options.categories = slot.values;
        slots.push({
            name,
            type: slot.type,
            ...options,
        });
    });
    if (Object.keys(formsFromFile).length > 0) {
        warnings.push(
            'forms defined in this file will be added to the default domain on import',
        );
    }
    return {
        dataType: 'domain', rawText, warnings, slots, bfForms, responses, forms: formsFromFile,
    };
};


export const validateDomain = (
    files,
    params,
) => {
    let domainFiles = files.filter(file => file?.dataType === 'domain');
    if ((domainFiles.length) > 1) {
        domainFiles = domainFiles.map((domainFile, idx) => {
            if (idx === 0) {
                return domainFile;
            }
            return {
                ...domainFile,
                warnings: [...(domainFile?.warnings || []),
                    'You have multiple domain files if some data conflicts, the one from the first file with that data will be used (same ways has rasa merges domains)'],
            };
        });
    }
    domainFiles = domainFiles.map(domainFile => validateADomain(domainFile, params));

    return [
        files.map((file) => {
            if (file?.dataType !== 'domain') return file;
            return domainFiles.shift();
        }),
        params,
    ];
};
