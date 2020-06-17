import { safeLoad, safeDump } from 'js-yaml';
import { isEqual } from 'lodash';

const INTERNAL_SLOTS = [
    'bf_forms',
    'fallback_language',
];

export const loadDomain = ({
    rawText,
    defaultDomain = {},
    projectLanguages,
    fallbackImportLanguage,
}) => {
    let domain;
    try {
        domain = safeLoad(rawText);
        if (!['templates', 'responses', 'slots'].some(k => k in domain)) throw new Error();
    } catch (e) {
        return { errors: ['Domain could not be parsed from YAML.'] };
    }
    const { slots: slotsFromFile = {}, templates: legacyResponsesFromFile = {}, responses: modernResponsesFromFile = {} } = domain;
    const { slots: defaultSlots = {}, responses: defaultResponses = {} } = defaultDomain;
    const responsesFromFile = { ...legacyResponsesFromFile, ...modernResponsesFromFile };
    // get forms
    const bfForms = 'bf_forms' in slotsFromFile
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

    Object.keys(slotsFromFile).forEach((name) => {
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

    return {
        rawText, warnings, slots, bfForms, responses,
    };
};
