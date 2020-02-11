import { safeLoad, safeDump } from 'js-yaml';
import { isEqual } from 'lodash';

export const loadDomain = ({
    rawText,
    defaultDomain = {},
    projectLanguages,
    fallbackImportLanguage,
}) => {
    let domain;
    try {
        domain = safeLoad(rawText);
        if (!['templates', 'slots'].some(k => k in domain)) throw new Error();
    } catch (e) {
        return { errors: ['Domain could not be parsed from YAML.'] };
    }
    const { slots: slotsFromFile = {}, templates: templatesFromFile = {} } = domain;
    const { slots: defaultSlots = {}, templates: defaultTemplates = {} } = defaultDomain;
    // do not import slots or templates that are in current default domain
    Object.keys(defaultSlots).forEach((k) => {
        delete slotsFromFile[k];
    });
    Object.keys(defaultTemplates).forEach((k) => {
        delete templatesFromFile[k];
    });

    const warnings = [];
    const templates = [];
    const slots = [];

    Object.keys(templatesFromFile).forEach((key) => {
        const template = templatesFromFile[key];
        const values = [];
        let firstMetadataFound;
        template.forEach((item) => {
            const { language, metadata, ...rest } = item;
            const lang = language || fallbackImportLanguage;
            if (!firstMetadataFound && metadata) firstMetadataFound = metadata;
            if (firstMetadataFound && !isEqual(firstMetadataFound, metadata)) {
                warnings.push(
                    `Different metadata found for single template '${key}', but Botfront does not support it.`,
                );
            }
            if (!projectLanguages.includes(lang)) {
                warnings.push(
                    `Template '${key}' defined for '${lang}', but no such language used by project.`,
                );
            } else {
                const valueIndex = values.findIndex(v => v.lang === lang);
                if (valueIndex > -1) {
                    values[valueIndex].sequence = [
                        ...values[valueIndex].sequence,
                        { content: safeDump(rest) },
                    ];
                } else {
                    values.push({ lang, sequence: [{ content: safeDump(rest) }] });
                }
            }
        });
        templates.push({
            ...(firstMetadataFound ? { metadata: firstMetadataFound } : {}),
            values,
            key,
        });
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
        rawText, warnings, slots, templates,
    };
};
